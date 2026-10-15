const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { isAuthenticated } = require('../middleware/auth');

router.get('/public/:token', quotationController.getPublicQuotation);

router.get('/', isAuthenticated, quotationController.getQuotations);
router.get('/:id', isAuthenticated, quotationController.getQuotationById);
router.post('/', isAuthenticated, quotationController.createQuotation);
router.put('/:id', isAuthenticated, quotationController.updateQuotation);
router.post('/:id/share', isAuthenticated, quotationController.generateShareableLink);
router.post('/:id/revoke', isAuthenticated, quotationController.revokeShareableLink);

module.exports = router;