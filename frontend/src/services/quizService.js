import api from './api';

const quizService = {
  getQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data?.data || response.data;
  },

  getQuizById: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data?.data || response.data;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data?.data || response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data?.data || response.data;
  },

  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data?.data || response.data;
  },
};

export default quizService;