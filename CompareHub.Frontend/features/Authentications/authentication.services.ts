import { apiClient } from '@/lib/api-client';
import { ApiResponse, AuthResponse } from './authentication.types';

export const authenticationService = {
  async register(payload: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', payload);
    return response.data.data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', payload);
    return response.data.data;
  }
};
