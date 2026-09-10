const express = require('express');
const { signup, login, adminLogin, getCurrentUser, updatePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/password', authMiddleware, updatePassword);

module.exports = router;