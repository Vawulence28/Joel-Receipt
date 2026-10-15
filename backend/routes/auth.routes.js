const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyPassword, hashPassword, logAudit } = require('../utils/helpers');
const { loginLimiter } = require('../middleware/rateLimiter');
const { isAuthenticated } = require('../middleware/auth');

// Initial administrator setup
router.post('/setup-admin', async (req, res) => {
  try {
    const { email, password, fullName, setupSecret } = req.body;

    if (!process.env.SETUP_SECRET || setupSecret !== process.env.SETUP_SECRET) {
      return res.status(403).json({ error: 'Forbidden setup secret key.' });
    }

    const checkAdmin = await pool.query('SELECT COUNT(*) FROM jcir_users WHERE role = $1', ['admin']);
    if (parseInt(checkAdmin.rows[0].count, 10) > 0) {
      return res.status(400).json({ error: 'Administrator has already been initialized.' });
    }

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO jcir_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'admin') RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, fullName]
    );

    await logAudit(pool, result.rows[0].id, 'INITIALIZE_ADMIN', 'First administrator setup successfully.', req.ip);

    res.status(201).json({
      message: 'Administrator account setup successfully.',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Setup admin error:', err);
    res.status(500).json({ error: 'Internal server error during setup.' });
  }
});

// Admin login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM jcir_users WHERE email = $1 AND is_active = TRUE', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const matches = await verifyPassword(password, user.password_hash);
    if (!matches) {
      await logAudit(pool, user.id, 'LOGIN_FAILED', 'Incorrect password entered.', req.ip);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.regenerate(async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create session.' });
      }

      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.role = user.role;

      await logAudit(pool, user.id, 'LOGIN_SUCCESS', 'Administrator logged in successfully.', req.ip);

      res.json({
        message: 'Login successful.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Fetch user session
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM jcir_users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Logout
router.post('/logout', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  req.session.destroy(async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to terminate session.' });
    }
    res.clearCookie('connect.sid');
    await logAudit(pool, userId, 'LOGOUT', 'Administrator logged out.', req.ip);
    res.json({ message: 'Logged out successfully.' });
  });
});

module.exports = router;