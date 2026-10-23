import axios from 'axios';
import { TOKEN_KEY, authStore } from '@/features/Authentications/auth-store';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// An expired or revoked token: sign out so the app shows the signed-out state instead of failing silently.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && axios.isAxiosError(error) && error.response?.status === 401 && authStore.getSnapshot().token) {
      authStore.signOut();
    }
    return Promise.reject(error);
  }
);
