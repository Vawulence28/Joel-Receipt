const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, clientController.getClients);
router.get('/:id', isAuthenticated, clientController.getClientById);
router.post('/', isAuthenticated, clientController.createClient);
router.put('/:id', isAuthenticated, clientController.updateClient);

module.exports = router;