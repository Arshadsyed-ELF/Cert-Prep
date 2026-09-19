import api from './api';

const adminService = {
    getOverview: async () => {
        const response = await api.get('/admin/overview');
        return response.data?.data || response.data;
    },
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data?.data || response.data;
    },
    getUserReadiness: async (userId) => {
        const response = await api.get(`/admin/users/${userId}/readiness`);
        return response.data?.data || response.data;
    },
    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data?.data || response.data;
    },
};

export default adminService;
