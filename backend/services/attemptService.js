const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Submit a quiz attempt
const submitAttempt = async (userId, quizId, answers) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw new Error('Quiz not found');
    }

    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    answers.forEach(answer => {
        const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
        if (question && question.correctAnswer === answer.selectedAnswer) {
            correctAnswers++;
        }
    });

    const score = correctAnswers;
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= quiz.passingPercentage;

    const attempt = new QuizAttempt({
        userId,
        quizId,
        answers,
        score,
        percentage,
        passed,
        startedAt: new Date(),
        completedAt: new Date()
    });

    await attempt.save();
    return attempt;
};

// Get user's quiz attempts
const getUserAttempts = async (userId) => {
    return await QuizAttempt.find({ userId }).populate('quizId');
};

// Get a specific quiz attempt
const getAttemptById = async (attemptId) => {
    return await QuizAttempt.findById(attemptId).populate('quizId');
};

module.exports = {
    submitAttempt,
    getUserAttempts,
    getAttemptById
};