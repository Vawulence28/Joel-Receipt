const express = require('express');
const router = express.Router();
const letterController = require('../controllers/letter.controller');

// Simple auth check middleware matching existing project conventions
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

router.use(isAuthenticated);

router.get('/', letterController.getLetters);
router.post('/', letterController.createLetter);
router.get('/:id', letterController.getLetterById);
router.put('/:id', letterController.updateLetter);
router.post('/:id/duplicate', letterController.duplicateLetter);
router.delete('/:id', letterController.deleteLetter);

module.exports = router;