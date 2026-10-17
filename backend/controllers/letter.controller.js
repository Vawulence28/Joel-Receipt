const pool = require('../config/db');

// Helper to generate unique letter reference number
const generateLetterNumber = async () => {
  const countRes = await pool.query('SELECT COUNT(*) FROM jcir_letters');
  const count = parseInt(countRes.rows[0].count, 10) + 1;
  const year = new Date().getFullYear();
  return `JC-LTR-${year}-${String(count).padStart(3, '0')}`;
};

// Get all letters with optional search & filtering
exports.getLetters = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM jcir_letters WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (recipient_name ILIKE $${params.length} OR subject ILIKE $${params.length} OR letter_number ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get single letter with business settings and revisions
exports.getLetterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const letterRes = await pool.query('SELECT * FROM jcir_letters WHERE id = $1', [id]);
    
    if (letterRes.rows.length === 0) {
      return res.status(404).json({ error: 'Letter not found.' });
    }

    const settingsRes = await pool.query('SELECT * FROM jcir_settings LIMIT 1');
    const revisionsRes = await pool.query('SELECT * FROM jcir_letter_revisions WHERE letter_id = $1 ORDER BY revision_number DESC', [id]);

    res.json({
      letter: letterRes.rows[0],
      settings: settingsRes.rows[0] || {},
      revisions: revisionsRes.rows[0] ? revisionsRes.rows : []
    });
  } catch (err) {
    next(err);
  }
};

// Create a new letter
exports.createLetter = async (req, res, next) => {
  try {
    const {
      recipient_name,
      recipient_address,
      subject,
      salutation,
      letter_body,
      closing_statement,
      signatory_name,
      signatory_position,
      letter_date,
      status
    } = req.body;

    if (!recipient_name || !subject || !letter_body || !signatory_name) {
      return res.status(400).json({ error: 'Missing required fields (recipient, subject, body, signatory).' });
    }

    const letterNumber = await generateLetterNumber();
    const dateToUse = letter_date || new Date().toISOString().split('T')[0];
    const letterStatus = status || 'Draft';

    const query = `
      INSERT INTO jcir_letters 
      (letter_number, recipient_name, recipient_address, subject, salutation, letter_body, closing_statement, signatory_name, signatory_position, letter_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      letterNumber,
      recipient_name,
      recipient_address || '',
      subject,
      salutation || 'Dear Sir/Madam,',
      letter_body,
      closing_statement || 'Yours faithfully,',
      signatory_name,
      signatory_position || 'Managing Consultant',
      dateToUse,
      letterStatus
    ];

    const newLetter = await pool.query(query, values);

    // Create initial revision snapshot
    await pool.query(
      'INSERT INTO jcir_letter_revisions (letter_id, revision_number, snapshot_data) VALUES ($1, $2, $3)',
      [newLetter.rows[0].id, 1, JSON.stringify(newLetter.rows[0])]
    );

    res.status(201).json(newLetter.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update existing letter and create revision history
exports.updateLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      recipient_name,
      recipient_address,
      subject,
      salutation,
      letter_body,
      closing_statement,
      signatory_name,
      signatory_position,
      letter_date,
      status
    } = req.body;

    const existingRes = await pool.query('SELECT * FROM jcir_letters WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Letter not found.' });
    }

    const currentLetter = existingRes.rows[0];

    // Count existing revisions for version numbering
    const revCountRes = await pool.query('SELECT COUNT(*) FROM jcir_letter_revisions WHERE letter_id = $1', [id]);
    const nextRevNum = parseInt(revCountRes.rows[0].count, 10) + 1;

    // Save current state into revision history before overwriting
    await pool.query(
      'INSERT INTO jcir_letter_revisions (letter_id, revision_number, snapshot_data) VALUES ($1, $2, $3)',
      [id, nextRevNum, JSON.stringify(currentLetter)]
    );

    const updateQuery = `
      UPDATE jcir_letters 
      SET recipient_name = $1, recipient_address = $2, subject = $3, salutation = $4, 
          letter_body = $5, closing_statement = $6, signatory_name = $7, signatory_position = $8, 
          letter_date = $9, status = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *;
    `;

    const values = [
      recipient_name || currentLetter.recipient_name,
      recipient_address !== undefined ? recipient_address : currentLetter.recipient_address,
      subject || currentLetter.subject,
      salutation || currentLetter.salutation,
      letter_body || currentLetter.letter_body,
      closing_statement || currentLetter.closing_statement,
      signatory_name || currentLetter.signatory_name,
      signatory_position || currentLetter.signatory_position,
      letter_date || currentLetter.letter_date,
      status || currentLetter.status,
      id
    ];

    const updated = await pool.query(updateQuery, values);
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Duplicate an existing letter
exports.duplicateLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sourceRes = await pool.query('SELECT * FROM jcir_letters WHERE id = $1', [id]);
    
    if (sourceRes.rows.length === 0) {
      return res.status(404).json({ error: 'Source letter not found.' });
    }

    const src = sourceRes.rows[0];
    const newLetterNumber = await generateLetterNumber();

    const query = `
      INSERT INTO jcir_letters 
      (letter_number, recipient_name, recipient_address, subject, salutation, letter_body, closing_statement, signatory_name, signatory_position, letter_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, 'Draft')
      RETURNING *;
    `;

    const values = [
      newLetterNumber,
      `Copy of ${src.recipient_name}`,
      src.recipient_address,
      src.subject,
      src.salutation,
      src.letter_body,
      src.closing_statement,
      src.signatory_name,
      src.signatory_position
    ];

    const newLetter = await pool.query(query, values);
    
    await pool.query(
      'INSERT INTO jcir_letter_revisions (letter_id, revision_number, snapshot_data) VALUES ($1, $2, $3)',
      [newLetter.rows[0].id, 1, JSON.stringify(newLetter.rows[0])]
    );

    res.status(201).json(newLetter.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete draft letter
exports.deleteLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkRes = await pool.query('SELECT status FROM jcir_letters WHERE id = $1', [id]);
    
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Letter not found.' });
    }

    await pool.query('DELETE FROM jcir_letters WHERE id = $1', [id]);
    res.json({ message: 'Letter deleted successfully.' });
  } catch (err) {
    next(err);
  }
};