const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, reportController.getFinancialReport);

module.exports = router;