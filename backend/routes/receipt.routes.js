const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, receiptController.getReceipts);
router.get('/:id', isAuthenticated, receiptController.getReceiptById);
router.post('/standalone', isAuthenticated, receiptController.createStandaloneReceipt);
router.post('/:id/cancel', isAuthenticated, receiptController.cancelReceipt);

module.exports = router;