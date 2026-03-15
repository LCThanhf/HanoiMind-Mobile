import apiClient from '../apiClient';
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
        const res = await apiClient.post('/auth/login', payload);
        return await apiClient.post<AuthResponse>('/auth/login', payload) as any;
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