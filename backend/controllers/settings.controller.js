const pool = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jcir_settings LIMIT 1');
    res.json({ settings: result.rows[0] || {} });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { company_name, tagline, email, phone, address, currency_symbol, currency_code, default_payment_terms, bank_details } = req.body;

    const result = await pool.query(
      `UPDATE jcir_settings
       SET company_name = $1, tagline = $2, email = $3, phone = $4, address = $5, 
           currency_symbol = $6, currency_code = $7, default_payment_terms = $8, bank_details = $9
       WHERE id = (SELECT id FROM jcir_settings LIMIT 1) RETURNING *`,
      [company_name, tagline, email, phone, address, currency_symbol, currency_code, default_payment_terms, bank_details]
    );

    res.json({ settings: result.rows[0], message: 'Business settings updated successfully.' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};