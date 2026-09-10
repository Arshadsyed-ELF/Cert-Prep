const QuizAttempt = require('../models/QuizAttempt');

const getReadinessLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Ready';
    if (score >= 70) return 'Almost Ready';
    if (score >= 60) return 'Needs Improvement';
    return 'Not Ready';
};

const calculateReadinessScore = async (userId) => {
    const attempts = await QuizAttempt.find({ userId }).populate('quizId');

    if (!attempts || attempts.length === 0) {
        return {
            readiness: 'Not Assessed',
            message: 'Start your first quiz to calculate readiness.',
            score: 0,
            attempts: 0,
            averageScore: 0,
            bestScore: 0,
            recentScore: 0,
        };
    }

    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / totalAttempts;
    const recentScore = attempts[totalAttempts - 1].percentage || 0;
    const bestScore = Math.max(...attempts.map((attempt) => attempt.percentage || 0));
    const combinedScore = (averageScore * 0.5) + (recentScore * 0.3) + (bestScore * 0.2);

    return {
        readiness: getReadinessLabel(combinedScore),
        score: Number(combinedScore.toFixed(2)),
        attempts: totalAttempts,
        averageScore: Number(averageScore.toFixed(2)),
        bestScore: Number(bestScore.toFixed(2)),
        recentScore: Number(recentScore.toFixed(2)),
    };
};

const calculateReadinessByCertification = async (userId, certificationType) => {
    const attempts = await QuizAttempt.find({ userId }).populate('quizId');
    const filteredAttempts = attempts.filter((attempt) => {
        return attempt.quizId && attempt.quizId.certificationType && attempt.quizId.certificationType.toLowerCase() === String(certificationType).toLowerCase();
    });

    if (!filteredAttempts || filteredAttempts.length === 0) {
        return {
            certificationType,
            readiness: 'Not Assessed',
            message: 'No attempts found for this certification yet.',
            score: 0,
            attempts: 0,
        };
    }

    const totalAttempts = filteredAttempts.length;
    const averageScore = filteredAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / totalAttempts;
    const recentScore = filteredAttempts[totalAttempts - 1].percentage || 0;
    const bestScore = Math.max(...filteredAttempts.map((attempt) => attempt.percentage || 0));
    const combinedScore = (averageScore * 0.5) + (recentScore * 0.3) + (bestScore * 0.2);

    return {
        certificationType,
        readiness: getReadinessLabel(combinedScore),
        score: Number(combinedScore.toFixed(2)),
        attempts: totalAttempts,
        averageScore: Number(averageScore.toFixed(2)),
        bestScore: Number(bestScore.toFixed(2)),
        recentScore: Number(recentScore.toFixed(2)),
    };
};

module.exports = {
    calculateReadinessScore,
    calculateReadinessByCertification,
};