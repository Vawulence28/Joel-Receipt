const pool = require('../config/db');

exports.getClients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM jcir_clients';
    let params = [];

    if (search) {
      query += ' WHERE company_name ILIKE $1 OR contact_person ILIKE $1 OR email ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ clients: result.rows });
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ error: 'Failed to retrieve clients.' });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientRes = await pool.query('SELECT * FROM jcir_clients WHERE id = $1', [id]);
    if (clientRes.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const quotationsRes = await pool.query(
      'SELECT id, quotation_number, title, status, total_amount, created_at FROM jcir_quotations WHERE client_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const invoicesRes = await pool.query(
      'SELECT id, invoice_number, status, total_amount, outstanding_balance, issue_date, due_date FROM jcir_invoices WHERE client_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      client: clientRes.rows[0],
      quotations: quotationsRes.rows,
      invoices: invoicesRes.rows,
    });
  } catch (err) {
    console.error('Get client by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch client details.' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { company_name, contact_person, email, phone, address, city, state, notes } = req.body;
    if (!company_name || !email) {
      return res.status(400).json({ error: 'Company name and email are required.' });
    }

    const result = await pool.query(
      `INSERT INTO jcir_clients (company_name, contact_person, email, phone, address, city, state, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [company_name, contact_person, email, phone, address, city, state, notes]
    );

    res.status(201).json({ client: result.rows[0], message: 'Client created successfully.' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A client with this email already exists.' });
    }
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Failed to create client.' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, contact_person, email, phone, address, city, state, notes } = req.body;

    const result = await pool.query(
      `UPDATE jcir_clients
       SET company_name = $1, contact_person = $2, email = $3, phone = $4, address = $5, city = $6, state = $7, notes = $8
       WHERE id = $9 RETURNING *`,
      [company_name, contact_person, email, phone, address, city, state, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    res.json({ client: result.rows[0], message: 'Client updated successfully.' });
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Failed to update client.' });
  }
};