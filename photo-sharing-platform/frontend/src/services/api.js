import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Photo API
export const photoAPI = {
  getPhotos: (params) => api.get('/photos', { params }),
  getPhotoById: (id) => api.get(`/photos/${id}`),
  uploadPhoto: (formData) =>
    api.post('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePhoto: (id, data) => api.put(`/photos/${id}`, data),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
  getMyPhotos: (params) => api.get('/photos/my/uploads', { params }),
  addComment: (photoId, content) => api.post(`/photos/${photoId}/comment`, { content }),
  ratePhoto: (photoId, rating) => api.post(`/photos/${photoId}/rate`, { rating }),
  getComments: (photoId, params) => api.get(`/photos/${photoId}/comments`, { params }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
