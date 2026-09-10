import api from './api';

const attemptService = {
  submitAttempt: async (quizId, answers) => {
    try {
      const response = await api.post('/attempts', { quizId, answers });
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'An error occurred while submitting the attempt.' };
    }
  },

  getMyAttempts: async () => {
    try {
      const response = await api.get('/attempts/my');
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'An error occurred while fetching attempts.' };
    }
  },

  getAttemptDetails: async (attemptId) => {
    try {
      const response = await api.get(`/attempts/${attemptId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'An error occurred while fetching attempt details.' };
    }
  }
};

export default attemptService;