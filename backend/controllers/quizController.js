const Quiz = require('../models/Quiz');
const apiResponse = require('../utils/apiResponse');

exports.createQuiz = async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        return apiResponse.success(res, 'Quiz created successfully', quiz, 201);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error creating quiz', 500);
    }
};

exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        return apiResponse.success(res, 'Quizzes retrieved successfully', quizzes);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error retrieving quizzes', 500);
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return apiResponse.error(res, 'Quiz not found', 404);
        }
        return apiResponse.success(res, 'Quiz retrieved successfully', quiz);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error retrieving quiz', 500);
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!quiz) {
            return apiResponse.error(res, 'Quiz not found', 404);
        }
        return apiResponse.success(res, 'Quiz updated successfully', quiz);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error updating quiz', 500);
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) {
            return apiResponse.error(res, 'Quiz not found', 404);
        }
        return apiResponse.success(res, 'Quiz deleted successfully');
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error deleting quiz', 500);
    }
};