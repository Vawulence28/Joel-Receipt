const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { isAuthenticated } = require('../middleware/auth');

router.get('/summary', isAuthenticated, dashboardController.getDashboardSummary);

module.exports = router;