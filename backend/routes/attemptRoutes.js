const express = require('express');
const { submitAttempt, getMyAttempts, getAttemptById } = require('../controllers/attemptController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, submitAttempt);
router.get('/my', authMiddleware, getMyAttempts);
router.get('/:id', authMiddleware, getAttemptById);

module.exports = router;