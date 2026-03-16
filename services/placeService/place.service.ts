import apiClient from '../apiClient';
import { 
  Place, 
  SearchPlaceParams, 
  CreatePlacePayload 
} from './place.type';

const normalizePlaceListResponse = (payload: unknown): { data: Place[]; meta: any } => {
  if (Array.isArray(payload)) {
    return { data: payload as Place[], meta: null };
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return {
        data: record.data as Place[],
        meta: record.meta ?? null,
      };
    }

    if (Array.isArray(record.items)) {
      return {
        data: record.items as Place[],
        meta: record.meta ?? null,
      };
    }
  }

  return { data: [], meta: null };
};

export const PlacesService = {
  /**
   * Tìm kiếm & Nearby Search
   */
  findAll: async (params: SearchPlaceParams): Promise<{ data: Place[]; meta: any }> => {
    try {
      const payload = await apiClient.get('/places', { params });
      return normalizePlaceListResponse(payload);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết địa điểm
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