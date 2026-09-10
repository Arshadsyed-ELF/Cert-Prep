const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const apiResponse = require('../utils/apiResponse');

exports.getOverview = async (req, res) => {
    try {
        const [users, quizzes, attempts, passedAttempts, recentUsers, recentAttempts] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Quiz.countDocuments(),
            QuizAttempt.countDocuments(),
            QuizAttempt.countDocuments({ passed: true }),
            User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).limit(5),
            QuizAttempt.find().populate('quizId', 'title').populate('userId', 'name email').sort({ createdAt: -1 }).limit(8),
        ]);

        const attemptsByDay = await QuizAttempt.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        const quizPerformance = await QuizAttempt.aggregate([
            { $group: { _id: '$quizId', attempts: { $sum: 1 }, averagePercentage: { $avg: '$percentage' }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
            { $sort: { attempts: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'quizzes', localField: '_id', foreignField: '_id', as: 'quiz' } },
            { $unwind: { path: '$quiz', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 1, title: '$quiz.title', attempts: 1, averagePercentage: 1, passed: 1 } },
        ]);

        return apiResponse.success(res, 'Admin overview retrieved successfully', {
            metrics: {
                users,
                quizzes,
                attempts,
                passRate: attempts ? Math.round((passedAttempts / attempts) * 100) : 0,
            },
            recentUsers,
            recentAttempts,
            attemptsByDay,
            quizPerformance,
        });
    } catch (error) {
        return apiResponse.error(res, error.message || 'Unable to load admin overview', 500);
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        return apiResponse.success(res, 'Users retrieved successfully', users);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Unable to load users', 500);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, role: 'user' });
        if (!user) return apiResponse.error(res, 'User not found', 404);
        return apiResponse.success(res, 'User deleted successfully');
    } catch (error) {
        return apiResponse.error(res, error.message || 'Unable to delete user', 500);
    }
};
