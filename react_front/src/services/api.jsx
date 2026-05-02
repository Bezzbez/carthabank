import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    try {
      const store = useAuthStore.getState();
      const token = store?.accessToken || localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      const token = localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 429) {
      try { toast.error(error.response.data?.error || 'Too many requests'); } catch (e) {}
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const store = useAuthStore.getState();
        const refreshToken = store?.refreshToken || localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        try {
          useAuthStore.setState({ accessToken: newAccessToken, refreshToken: newRefreshToken, isAuthenticated: true });
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        } catch (e) {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        try { useAuthStore.getState().logout?.(); } catch (e) {}
        try { window.location.href = '/login'; } catch (e) {}
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth
const auth = {
  register: (firstName, lastName, email, password, phone) => api.post('/auth/register', { firstName, lastName, email, password, phone }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};

// User
const user = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
};

// Accounts
const accounts = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
};

// Transactions
const transactions = {
  getHistory: (filters = {}) => api.get('/transactions', { params: filters }),
  requestOTP: () => api.post('/transactions/otp/request'),
  transfer: (data) => api.post('/transactions/transfer', data),
  payBill: (data) => api.post('/transactions/bill-payment', data),
  deposit: (data) => api.post('/transactions/deposit', data),
};

// Admin
const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (filters = {}) => api.get('/admin/users', { params: filters }),
  getTransactions: (filters = {}) => api.get('/admin/transactions', { params: filters }),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/status`),
  changeRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// Gestionnaire
const gestionnaire = {
  getDashboard: () => api.get('/gestionnaire/dashboard'),
  getPendingTransfers: (filters = {}) => api.get('/gestionnaire/pending-transfers', { params: filters }),
  reviewTransfer: (id, data) => api.put(`/gestionnaire/transfers/${id}/review`, data),
  getLoans: (filters = {}) => api.get('/gestionnaire/loans', { params: filters }),
  reviewLoan: (id, data) => api.put(`/gestionnaire/loans/${id}/review`, data),
  getCustomers: (filters = {}) => api.get('/gestionnaire/customers', { params: filters }),
  toggleAccountFreeze: (id) => api.patch(`/gestionnaire/accounts/${id}/toggle-freeze`),
  getReviewHistory: () => api.get('/gestionnaire/review-history'),
};

// Loans (client)
const loans = {
  request: (data) => api.post('/loans/request', data),
  getMyLoans: (filters = {}) => api.get('/loans', { params: filters }),
  getDetails: (id) => api.get(`/loans/${id}`),
};

const apiService = {
  login: auth.login,
  register: auth.register,
  refresh: auth.refresh,
  logout: auth.logout,
  auth, user, accounts, transactions, admin, gestionnaire, loans,
  api,
};

export default apiService;