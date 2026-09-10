const express = require('express');
const { getOverview, getUsers, deleteUser } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();
router.use(authMiddleware, adminMiddleware);
router.get('/overview', getOverview);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
