import api from './api';

export const getReadinessScore = async (certificationType) => {
    try {
        const response = await api.get(`/readiness/${certificationType}`);
        return response.data?.data || response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching readiness score');
    }
};

export const getOverallReadiness = async () => {
    try {
        const response = await api.get('/readiness');
        return response.data?.data || response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching overall readiness');
    }
};

const readinessService = {
    getReadinessScore,
    getOverallReadiness,
};

export default readinessService;