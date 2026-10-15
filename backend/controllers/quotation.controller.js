const pool = require('../config/db');
const crypto = require('crypto');

const generateQuotationNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `JC-QT-${dateStr}-${randomSuffix}`;
};

exports.getQuotations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*, c.company_name, c.email as client_email 
       FROM jcir_quotations q 
       JOIN jcir_clients c ON q.client_id = c.id 
       ORDER BY q.created_at DESC`
    );
    res.json({ quotations: result.rows });
  } catch (err) {
    console.error('Get quotations error:', err);
    res.status(500).json({ error: 'Failed to retrieve quotations.' });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const qRes = await pool.query(
      `SELECT q.*, c.company_name, c.contact_person, c.email as client_email, c.phone, c.address
       FROM jcir_quotations q 
       JOIN jcir_clients c ON q.client_id = c.id 
       WHERE q.id = $1`,
      [id]
    );

    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found.' });
    }

    const itemsRes = await pool.query(
      'SELECT * FROM jcir_quotation_items WHERE quotation_id = $1 ORDER BY sort_order ASC',
      [id]
    );

    const revisionsRes = await pool.query(
      'SELECT id, revision_number, created_at FROM jcir_quotation_revisions WHERE quotation_id = $1 ORDER BY revision_number DESC',
      [id]
    );

    res.json({
      quotation: qRes.rows[0],
      items: itemsRes.rows,
      revisions: revisionsRes.rows,
    });
  } catch (err) {
    console.error('Get quotation error:', err);
    res.status(500).json({ error: 'Failed to fetch quotation.' });
  }
};

exports.createQuotation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { client_id, title, items, discount_amount = 0, additional_charges = 0, notes, terms_conditions, valid_until } = req.body;

    if (!client_id || !title || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Client, title, and at least one item are required.' });
    }

    let subtotal = 0;
    const computedItems = items.map((item, index) => {
      const qty = parseFloat(item.quantity) || 1;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const totalPrice = qty * unitPrice;
      subtotal += totalPrice;
      return {
        description: item.description,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        sort_order: index,
      };
    });

    const disc = parseFloat(discount_amount) || 0;
    const addCharges = parseFloat(additional_charges) || 0;
    const totalAmount = subtotal - disc + addCharges;
    const quotationNumber = generateQuotationNumber();

    const qRes = await client.query(
      `INSERT INTO jcir_quotations 
       (quotation_number, client_id, title, subtotal, discount_amount, additional_charges, total_amount, notes, terms_conditions, valid_until, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Draft') RETURNING *`,
      [quotationNumber, client_id, title, subtotal, disc, addCharges, totalAmount, notes, terms_conditions, valid_until]
    );

    const newQuotation = qRes.rows[0];

    for (const item of computedItems) {
      await client.query(
        `INSERT INTO jcir_quotation_items (quotation_id, description, quantity, unit_price, total_price, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newQuotation.id, item.description, item.quantity, item.unit_price, item.total_price, item.sort_order]
      );
    }

    await client.query(
      `INSERT INTO jcir_quotation_revisions (quotation_id, revision_number, snapshot_data, created_by)
       VALUES ($1, 1, $2, $3)`,
      [newQuotation.id, JSON.stringify({ quotation: newQuotation, items: computedItems }), req.session.userId]
    );

    await client.query('COMMIT');
    res.status(201).json({ quotation: newQuotation, message: 'Quotation created successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create quotation error:', err);
    res.status(500).json({ error: 'Failed to create quotation.' });
  } finally {
    client.release();
  }
};

exports.updateQuotation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { title, items, discount_amount = 0, additional_charges = 0, notes, terms_conditions, valid_until, status } = req.body;

    let subtotal = 0;
    const computedItems = items.map((item, index) => {
      const qty = parseFloat(item.quantity) || 1;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const totalPrice = qty * unitPrice;
      subtotal += totalPrice;
      return {
        description: item.description,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        sort_order: index,
      };
    });

    const disc = parseFloat(discount_amount) || 0;
    const addCharges = parseFloat(additional_charges) || 0;
    const totalAmount = subtotal - disc + addCharges;

    const qRes = await client.query(
      `UPDATE jcir_quotations
       SET title = $1, subtotal = $2, discount_amount = $3, additional_charges = $4, total_amount = $5, notes = $6, terms_conditions = $7, valid_until = $8, status = COALESCE($9, status)
       WHERE id = $10 RETURNING *`,
      [title, subtotal, disc, addCharges, totalAmount, notes, terms_conditions, valid_until, status, id]
    );

    if (qRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quotation not found.' });
    }

    await client.query('DELETE FROM jcir_quotation_items WHERE quotation_id = $1', [id]);

    for (const item of computedItems) {
      await client.query(
        `INSERT INTO jcir_quotation_items (quotation_id, description, quantity, unit_price, total_price, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, item.description, item.quantity, item.unit_price, item.total_price, item.sort_order]
      );
    }

    const revCountRes = await client.query('SELECT COUNT(*) FROM jcir_quotation_revisions WHERE quotation_id = $1', [id]);
    const nextRevNum = parseInt(revCountRes.rows[0].count) + 1;

    await client.query(
      `INSERT INTO jcir_quotation_revisions (quotation_id, revision_number, snapshot_data, created_by)
       VALUES ($1, $2, $3, $4)`,
      [id, nextRevNum, JSON.stringify({ quotation: qRes.rows[0], items: computedItems }), req.session.userId]
    );

    await client.query('COMMIT');
    res.json({ quotation: qRes.rows[0], message: 'Quotation updated and revision saved.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update quotation error:', err);
    res.status(500).json({ error: 'Failed to update quotation.' });
  } finally {
    client.release();
  }
};

exports.generateShareableLink = async (req, res) => {
  try {
    const { id } = req.params;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await pool.query(
      'UPDATE jcir_quotations SET public_token_hash = $1, is_public_active = TRUE WHERE id = $2',
      [tokenHash, id]
    );

    res.json({ message: 'Shareable link activated.', token: rawToken });
  } catch (err) {
    console.error('Share link generation error:', err);
    res.status(500).json({ error: 'Failed to generate share link.' });
  }
};

exports.revokeShareableLink = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE jcir_quotations SET public_token_hash = NULL, is_public_active = FALSE WHERE id = $1',
      [id]
    );
    res.json({ message: 'Shareable link revoked successfully.' });
  } catch (err) {
    console.error('Revoke link error:', err);
    res.status(500).json({ error: 'Failed to revoke link.' });
  }
};

exports.getPublicQuotation = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const qRes = await pool.query(
      `SELECT q.*, c.company_name, c.contact_person, c.email as client_email, c.phone, c.address
       FROM jcir_quotations q 
       JOIN jcir_clients c ON q.client_id = c.id 
       WHERE q.public_token_hash = $1 AND q.is_public_active = TRUE`,
      [tokenHash]
    );

    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found or link has expired/been revoked.' });
    }

    const itemsRes = await pool.query(
      'SELECT description, quantity, unit_price, total_price FROM jcir_quotation_items WHERE quotation_id = $1 ORDER BY sort_order ASC',
      [qRes.rows[0].id]
    );

    res.json({ quotation: qRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    console.error('Public quotation error:', err);
    res.status(500).json({ error: 'Failed to view quotation.' });
  }
};