import apiClient from '../apiClient';
import {
  Review,
  ReviewStats,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewFilter,
  ReviewSortBy
} from './review.type';

export const ReviewService = {
  /**
   * 1. Lấy danh sách review của địa điểm
   * Hỗ trợ phân trang, sắp xếp và lọc (Tích cực/Tiêu cực)
   */
  findAllByPlace: async (
    placeId: string,
    params: {
      page?: number;
      limit?: number;
      sort_by?: ReviewSortBy;
      sort_order?: 'ASC' | 'DESC';
      filter?: ReviewFilter
    }
  ): Promise<{ data: Review[], meta: any }> => {
    try {
      return await apiClient.get(`/reviews/place/${placeId}`, { params });
    } catch (error) { throw error; }
  },

  /**
   * 2. Lấy thống kê chi tiết (Dùng cho biểu đồ đánh giá)
   */
  getStats: async (placeId: string): Promise<ReviewStats> => {
    try {
      return await apiClient.get(`/reviews/place/${placeId}/stats`);
    } catch (error) { throw error; }
  },

  /**
   * 3. Gửi đánh giá mới
   */
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    try {
      return await apiClient.post('/reviews', payload);
    } catch (error) { throw error; }
  },

  /**
   * 4. Nhấn "Hữu ích" (Helpful)
   */
  toggleHelpful: async (reviewId: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.post(`/reviews/${reviewId}/helpful`);
    } catch (error) { throw error; }
  },

  /**
   * 5. Sửa đánh giá (Chỉ cho phép trong vòng 48h từ lúc gửi)
   */
  update: async (reviewId: string, payload: UpdateReviewPayload): Promise<Review> => {
    try {
      return await apiClient.patch(`/reviews/${reviewId}`, payload);
    } catch (error) { throw error; }
  },

  /**
   * 6. Xóa review (Dành cho người dùng tự xóa hoặc Admin)
   */
  remove: async (reviewId: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.delete(`/reviews/${reviewId}`);
    } catch (error) { throw error; }
  }
};