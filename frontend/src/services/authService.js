import api from './api';

export const signupUser = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const adminLoginUser = async (credentials) => {
  const response = await api.post('/auth/admin/login', credentials);
  return response.data;
};

export const getUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const response = await api.get('/auth/me');
  return response.data?.data || response.data?.user || null;
};

export const updatePassword = async (passwordData) => {
  const response = await api.put('/auth/password', passwordData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

const authService = {
  signup: signupUser,
  login: loginUser,
  adminLogin: adminLoginUser,
  logout: logoutUser,
  getUser,
  updatePassword,
};

export default authService;