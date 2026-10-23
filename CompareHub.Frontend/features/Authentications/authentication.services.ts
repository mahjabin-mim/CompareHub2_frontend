import { apiClient } from '@/lib/api-client';
import { AccountSettings, ApiResponse, AuthConfig, AuthResponse } from './authentication.types';

export const authenticationService = {
  async register(payload: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', payload);
    return response.data.data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', payload);
    return response.data.data;
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/google', { idToken });
    return response.data.data;
  },

  async getConfig(): Promise<AuthConfig> {
    const response = await apiClient.get<ApiResponse<AuthConfig>>('/api/v1/auth/config');
    return response.data.data;
  },

  async getSettings(): Promise<AccountSettings> {
    const response = await apiClient.get<ApiResponse<AccountSettings>>('/api/v1/auth/settings');
    return response.data.data;
  },

  async updateSettings(payload: { emailAlertsEnabled: boolean }): Promise<AccountSettings> {
    const response = await apiClient.put<ApiResponse<AccountSettings>>('/api/v1/auth/settings', payload);
    return response.data.data;
  }
};
