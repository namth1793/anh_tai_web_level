import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fquest_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fquest_token');
      localStorage.removeItem('fquest_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000/uploads';
export const getImageUrl = (filename) => {
  if (!filename || filename === 'sample.jpg') return null;
  if (filename.startsWith('http')) return filename;
  return `${UPLOADS_URL}/${filename}`;
};