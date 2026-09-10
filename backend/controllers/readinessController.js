const readinessService = require('../services/readinessService');
const apiResponse = require('../utils/apiResponse');

exports.getOverallReadiness = async (req, res) => {
    try {
        const userId = req.user && (req.user.id || req.user._id);
        const readinessScore = await readinessService.calculateReadinessScore(userId);
        return apiResponse.success(res, 'Readiness retrieved successfully', readinessScore);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error retrieving readiness', 500);
    }
};

exports.getReadinessByCertification = async (req, res) => {
    try {
        const userId = req.user && (req.user.id || req.user._id);
        const certificationType = req.params.certificationType;
        const readinessScore = await readinessService.calculateReadinessByCertification(userId, certificationType);
        return apiResponse.success(res, 'Certification readiness retrieved successfully', readinessScore);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error retrieving certification readiness', 500);
    }
};