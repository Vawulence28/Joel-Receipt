const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, invoiceController.getInvoices);
router.get('/:id', isAuthenticated, invoiceController.getInvoiceById);
router.post('/', isAuthenticated, invoiceController.createInvoice);
router.post('/:id/payments', isAuthenticated, invoiceController.addPayment);
router.post('/:id/cancel', isAuthenticated, invoiceController.cancelInvoice);

module.exports = router;