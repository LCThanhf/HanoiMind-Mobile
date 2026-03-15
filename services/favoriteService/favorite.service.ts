// favoriteService/favorite.service.ts

import apiClient from '../apiClient';
import { 
  FavoriteType, 
  ToggleFavoritePayload, 
  FavoriteResponse, 
  FriendFavoritePlace 
} from './favorite.type';

export const FavoriteService = {
  /**
   * 1. Thả tim hoặc Bỏ tim (Place hoặc Journey)
   */
  toggle: async (payload: ToggleFavoritePayload): Promise<FavoriteResponse> => {
    try {
      return await apiClient.post('/favorites/toggle', payload);
    } catch (error) { throw error; }
  },

  /**
   * 2. Xem danh sách cá nhân đã yêu thích (theo loại)
   */
  getMyFavorites: async (type: FavoriteType): Promise<any[]> => {
    try {
      return await apiClient.get('/favorites', { params: { type } });
    } catch (error) { throw error; }
  },

  getFriendsFavoritePlaces: async (): Promise<FriendFavoritePlace[]> => {
    try {
      return await apiClient.get('/favorites/friends');
    } catch (error) { throw error; }
  }
};