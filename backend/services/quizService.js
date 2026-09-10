import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { validateQuizData } from '../utils/validation.js';
import apiResponse from '../utils/apiResponse.js';

// Create a new quiz
export const createQuiz = async (quizData) => {
    const { error } = validateQuizData(quizData);
    if (error) {
        throw new Error(error.details[0].message);
    }

    const quiz = new Quiz(quizData);
    await quiz.save();
    return quiz;
};

// Get all quizzes
export const getAllQuizzes = async () => {
    return await Quiz.find();
};

// Get a quiz by ID
export const getQuizById = async (quizId) => {
    return await Quiz.findById(quizId);
};

// Update a quiz
export const updateQuiz = async (quizId, quizData) => {
    const { error } = validateQuizData(quizData);
    if (error) {
        throw new Error(error.details[0].message);
    }

    return await Quiz.findByIdAndUpdate(quizId, quizData, { new: true });
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
    return await Quiz.findByIdAndDelete(quizId);
};

// Get quiz attempts for a specific quiz
export const getQuizAttempts = async (quizId) => {
    return await QuizAttempt.find({ quizId });
};