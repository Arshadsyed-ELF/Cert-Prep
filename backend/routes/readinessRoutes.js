const express = require('express');
const router = express.Router();
const readinessController = require('../controllers/readinessController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, readinessController.getOverallReadiness);
router.get('/:certificationType', authMiddleware, readinessController.getReadinessByCertification);

module.exports = router;