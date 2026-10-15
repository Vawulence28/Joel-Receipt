const pool = require('../config/db');

const generateReceiptNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `JC-RCP-${dateStr}-${randomSuffix}`;
};

const generateReferenceNumber = (method) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'TRF';
  if (method === 'Cash') prefix = 'CSH';
  if (method === 'POS') prefix = 'POS';
  if (method === 'Cheque') prefix = 'CHQ';
  return `${prefix}-${dateStr}-${randomSuffix}`;
};

exports.getReceipts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, c.company_name, c.email as client_email 
       FROM jcir_receipts r 
       JOIN jcir_clients c ON r.client_id = c.id 
       ORDER BY r.created_at DESC`
    );
    res.json({ receipts: result.rows });
  } catch (err) {
    console.error('Get receipts error:', err);
    res.status(500).json({ error: 'Failed to retrieve receipts.' });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.*, c.company_name, c.contact_person, c.email as client_email, c.phone, c.address,
              i.invoice_number
       FROM jcir_receipts r 
       JOIN jcir_clients c ON r.client_id = c.id 
       LEFT JOIN jcir_invoices i ON r.invoice_id = i.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found.' });
    }

    const settingsRes = await pool.query('SELECT * FROM jcir_settings LIMIT 1');

    res.json({
      receipt: result.rows[0],
      settings: settingsRes.rows[0] || {},
    });
  } catch (err) {
    console.error('Get receipt error:', err);
    res.status(500).json({ error: 'Failed to fetch receipt.' });
  }
};

exports.createStandaloneReceipt = async (req, res) => {
  try {
    const { client_id, amount_received, payment_method = 'Bank Transfer', description, notes } = req.body;

    if (!client_id || !amount_received || !description) {
      return res.status(400).json({ error: 'Client, amount received, and description are required.' });
    }

    const amt = parseFloat(amount_received);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Valid positive receipt amount required.' });
    }

    const receiptNumber = generateReceiptNumber();
    const referenceNumber = generateReferenceNumber(payment_method); // Auto-generated reference

    const result = await pool.query(
      `INSERT INTO jcir_receipts 
       (receipt_number, client_id, amount_received, payment_method, reference_number, description, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Issued') RETURNING *`,
      [receiptNumber, client_id, amt, payment_method, referenceNumber, description, notes]
    );

    res.status(201).json({ receipt: result.rows[0], message: 'Standalone receipt generated successfully with auto reference.' });
  } catch (err) {
    console.error('Create standalone receipt error:', err);
    res.status(500).json({ error: 'Failed to generate receipt.' });
  }
};

exports.cancelReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE jcir_receipts SET status = 'Cancelled' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found.' });
    }
    res.json({ receipt: result.rows[0], message: 'Receipt marked as cancelled.' });
  } catch (err) {
    console.error('Cancel receipt error:', err);
    res.status(500).json({ error: 'Failed to cancel receipt.' });
  }
};