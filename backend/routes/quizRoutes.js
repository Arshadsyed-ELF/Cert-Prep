const express = require('express');
const { 
    createQuiz, 
    getQuizzes, 
    getQuizById, 
    updateQuiz, 
    deleteQuiz 
} = require('../controllers/quizController');
const adminMiddleware = require('../middleware/adminMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Admin-only routes
router.post('/', authMiddleware, adminMiddleware, createQuiz);
router.put('/:id', authMiddleware, adminMiddleware, updateQuiz);
router.delete('/:id', authMiddleware, adminMiddleware, deleteQuiz);

// Public routes
router.get('/', getQuizzes);
router.get('/:id', getQuizById);

module.exports = router;