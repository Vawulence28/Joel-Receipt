const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, settingsController.getSettings);
router.put('/', isAuthenticated, settingsController.updateSettings);

module.exports = router;