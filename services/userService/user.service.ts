// src/services/usersService/users.service.ts

import apiClient from '../apiClient';
import { 
  User, 
  PublicProfile, 
  TravelDNA, 
  MerchantRequestPayload, 
  UserSearchResult
} from './user.type';

export const UsersService = {
  /**
   * Lấy thông tin hồ sơ của chính mình
   */
  getMe: async (): Promise<User> => {
    try {
      return await apiClient.get('/users/profile');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật hồ sơ cá nhân
   */
  updateMe: async (payload: Partial<User>): Promise<User> => {
    try {
      return await apiClient.patch('/users/profile', payload);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xem hồ sơ công khai của người khác
   */
  getPublicProfile: async (userId: string): Promise<PublicProfile> => {
    try {
      return await apiClient.get(`/users/${userId}/public-profile`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thống kê sở thích cá nhân (Travel DNA)
   */
  getMyTravelDNA: async (): Promise<TravelDNA> => {
    try {
      return await apiClient.get('/users/profile/stats');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gửi yêu cầu nâng cấp lên tài khoản Merchant
   */
  requestMerchant: async (payload: MerchantRequestPayload): Promise<any> => {
    try {
      return await apiClient.post('/users/request-merchant', payload);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Admin: Lấy danh sách toàn bộ người dùng
   */
  adminFindAll: async (): Promise<User[]> => {
    try {
      return await apiClient.get('/users');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Admin: Xóa người dùng
   */
  adminRemove: async (userId: string): Promise<{ message: string }> => {
    try {
      return await apiClient.delete(`/users/${userId}`);
    } catch (error) {
      throw error;
    }
  },

  searchUsers: async (keyword: string): Promise<UserSearchResult[]> => {
    try {
      // Gửi keyword qua query params
      return await apiClient.get('/users/search', { params: { keyword } });
    } catch (error) {
      throw error;
    }
  },
};