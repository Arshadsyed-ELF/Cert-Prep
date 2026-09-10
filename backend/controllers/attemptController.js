const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const apiResponse = require('../utils/apiResponse');

exports.submitAttempt = async (req, res) => {
    try {
        const { quizId, answers = [] } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return apiResponse.error(res, 'Quiz not found', 404);
        }

        const totalQuestions = quiz.questions.length;
        if (!totalQuestions) {
            return apiResponse.error(res, 'This quiz has no questions', 400);
        }

        const questionMap = new Map(quiz.questions.map((question) => [question._id.toString(), question]));
        let score = 0;

        const normalizedAnswers = answers.map((answer) => {
            const question = questionMap.get(String(answer.questionId));
            const selectedAnswer = answer.selectedAnswer;
            const expectedAnswer = question?.correctAnswer;
            const selectedAnswers = Array.isArray(selectedAnswer) ? selectedAnswer.slice().sort() : [selectedAnswer];
            const expectedAnswers = Array.isArray(expectedAnswer) ? expectedAnswer.slice().sort() : [expectedAnswer];
            const isCorrect = Boolean(question && selectedAnswers.length === expectedAnswers.length && selectedAnswers.every((value, index) => value === expectedAnswers[index]));

            if (isCorrect) {
                score += 1;
            }

            return {
                questionId: answer.questionId,
                selectedAnswer,
                isCorrect,
            };
        });

        const percentage = totalQuestions ? (score / totalQuestions) * 100 : 0;
        const passed = percentage >= quiz.passingPercentage;

        const attempt = new QuizAttempt({
            userId: req.user.id,
            quizId,
            answers: normalizedAnswers,
            score,
            percentage,
            passed,
            startedAt: new Date(),
            completedAt: new Date(),
        });

        await attempt.save();

        return apiResponse.success(res, 'Quiz submitted successfully', {
            attemptId: attempt._id,
            score,
            totalQuestions,
            percentage,
            passed,
            correctAnswers: score,
            incorrectAnswers: totalQuestions - score,
        });
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error submitting quiz attempt', 500);
    }
};

exports.getMyAttempts = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ userId: req.user.id }).populate('quizId');
        return apiResponse.success(res, 'Attempt history retrieved successfully', attempts);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error retrieving attempt history', 500);
    }
};

exports.getAttemptById = async (req, res) => {
    try {
        const { id } = req.params;
        const attempt = await QuizAttempt.findById(id).populate('quizId');

        if (!attempt) {
            return apiResponse.error(res, 'Attempt not found', 404);
        }

        return apiResponse.success(res, 'Attempt retrieved successfully', attempt);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error retrieving attempt', 500);
    }
};