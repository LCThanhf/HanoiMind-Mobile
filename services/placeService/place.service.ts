// src/services/placesService/places.service.ts

import apiClient from '../apiClient';
import { 
  Place, 
  SearchPlaceParams, 
  CreatePlacePayload 
} from './place.type';

export const PlacesService = {
  /**
   * Tìm kiếm & Nearby Search
   * Khớp với @Get() trong PlacesController
   */
  findAll: async (params: SearchPlaceParams): Promise<{ data: Place[]; meta: any }> => {
    try {
      return await apiClient.get('/places', { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết địa điểm
   * Khớp với @Get(':id') trong PlacesController
   */
  findOne: async (id: string): Promise<Place> => {
    try {
      return await apiClient.get(`/places/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo địa điểm mới
   * Khớp với @Post() trong PlacesController
   */
  create: async (payload: CreatePlacePayload): Promise<{ message: string; data: Place }> => {
    try {
      return await apiClient.post('/places', payload);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật địa điểm
   * Khớp với @Patch(':id') trong PlacesController
   */
  update: async (id: string, payload: Partial<CreatePlacePayload>): Promise<any> => {
    try {
      return await apiClient.patch(`/places/${id}`, payload);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa địa điểm
   * Khớp với @Delete(':id') trong PlacesController
   */
  remove: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await apiClient.delete(`/places/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Merchant: Gửi yêu cầu xác nhận chủ sở hữu (Claim Place)
   * Khớp với @Post(':id/claim') sử dụng FilesInterceptor
   * * @param id ID địa điểm
   * @param businessProofs Mảng các object chứa thông tin file (uri, name, type)
   */
  claimPlace: async (id: string, businessProofs: any[]): Promise<any> => {
    try {
      const formData = new FormData();
      
      businessProofs.forEach((file) => {
        formData.append('business_proof', {
          uri: file.uri,
          name: file.name || `proof_${Date.now()}.jpg`,
          type: file.type || 'image/jpeg',
        } as any);
      });

      return await apiClient.post(`/places/${id}/claim`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw error;
    }
  },
};