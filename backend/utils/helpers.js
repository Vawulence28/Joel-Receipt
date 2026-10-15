const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const logAudit = async (pool, userId, action, details, ip) => {
  try {
    await pool.query(
      'INSERT INTO jcir_audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, action, details, ip]
    );
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

module.exports = { hashPassword, verifyPassword, logAudit };