import axios from 'axios';

const createApi = (baseURL) => {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('meditrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('meditrack_token');
        localStorage.removeItem('meditrack_user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const userApi = createApi(import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:4001');
export const medicalApi = createApi(import.meta.env.VITE_MEDICAL_SERVICE_URL || 'http://localhost:4002');
export const healthApi = createApi(import.meta.env.VITE_HEALTH_SERVICE_URL || 'http://localhost:4003');
export const aiApi = createApi(import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:4004');
