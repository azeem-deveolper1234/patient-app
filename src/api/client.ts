import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { API_TIMEOUT_MS } from '../config/environment';
import { notifyUnauthorized } from '../session';

const TOKEN_KEY = 'token';

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

API.interceptors.request.use(async (req) => {
  const token = await getStoredToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const url = String(err.config?.url || '');
    const isAuth = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuth && (await getStoredToken())) {
      await setStoredToken(null);
      notifyUnauthorized();
    }
    return Promise.reject(err);
  }
);

export const register = (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => API.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  API.post('/auth/login', data);

export const joinQueue = (data: {
  serviceName: string;
  appointmentDate: string;
  priority: string;
  notes?: string;
  paymentMethod?: string;
}) => API.post('/queue/join', data);

export const getQueueStatus = () => API.get('/queue/status');

export const cancelQueue = () => API.post('/queue/cancel');

export const getQueueHistory = () => API.get('/queue/history');

export const getMyReports = () => API.get('/medical-reports/my-reports');

export const getAllDoctors = () => API.get('/doctors/all');

export const createPayment = (data: {
  queueId: string;
  doctorId: string;
  totalAmount: number;
  paymentMethod: string;
  walletChannel?: string;
}) => API.post('/payments/create', data);

export default API;
