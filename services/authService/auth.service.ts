import apiClient from 'services/apiClient';
import { 
  AuthResponse, 
  LoginPayload, 
  RegisterPayload 
} from './auth.types';

export const AuthService = {

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      return await apiClient.post('/auth/register', payload);
    } catch (error) {
      throw error;
    }
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      return await apiClient.post('/auth/login', payload);
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      return await apiClient.post('/auth/logout');
    } catch (error) {
      throw error;
    }
  },

  refresh: async (): Promise<Pick<AuthResponse, 'access_token' | 'refresh_token'>> => {
    try {
      return await apiClient.post('/auth/refresh');
    } catch (error) {
      throw error;
    }
  },

  googleLoginMobile: async (googleToken: string): Promise<AuthResponse> => {
    return await apiClient.post('/auth/google/mobile', { token: googleToken });
  }
};