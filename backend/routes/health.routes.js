const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: dbResult.rows[0].now,
      uptime: process.uptime(),
    });
  } catch (err) {
    console.error('Health check database failure:', err);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

module.exports = router;