import apiClient from '../apiClient';
import {
  Journey,
  CreateJourneyPayload,
  UpdateJourneyPayload,
  AddStopPayload,
  GetPublicFeedParams,
  UpdateStopPayload // Đã import thêm type mới
} from './journey.type';

export const JourneyService = {
  /**
   * 1. Tạo hành trình mới
   */
  create: async (payload: CreateJourneyPayload): Promise<Journey> => {
    return await apiClient.post('/journeys', payload);
  },

  /**
   * 2. Lấy danh sách hành trình của tôi
   */
  findMy: async (): Promise<Journey[]> => {
    return await apiClient.get('/journeys/my-journeys');
  },

  /**
   * 3. Lấy danh sách hành trình công khai (Feed) với bộ lọc nâng cao
   */
  getPublicFeed: async (params: GetPublicFeedParams): Promise<Journey[]> => {
    return await apiClient.get('/journeys/public', { params });
  },

  /**
   * 4. Xem chi tiết hành trình
   */
  findOne: async (id: string): Promise<Journey> => {
    return await apiClient.get(`/journeys/${id}`);
  },

  /**
   * 5. Cập nhật thông tin hành trình (Avatar, Tags, v.v.)
   */
  update: async (id: string, payload: UpdateJourneyPayload): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}`, payload);
  },

  /**
   * 6. Xóa hành trình
   */
  remove: async (id: string): Promise<any> => {
    return await apiClient.delete(`/journeys/${id}`);
  },

  /**
   * 7. Thêm địa điểm vào lịch trình
   */
  addStop: async (id: string, payload: AddStopPayload): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/add-stop`, payload);
  },

  /**
   * 8. Cập nhật thông tin điểm dừng & Cập nhật thanh toán N-N
   */
  updateStop: async (journeyId: string, dayId: string, stopId: string, payload: UpdateStopPayload): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}`, payload);
  },

  /**
   * 9. Xóa một địa điểm khỏi lịch trình
   */
  removeStop: async (id: string, dayNumber: number, stopId: string): Promise<any> => {
    return await apiClient.delete(`/journeys/${id}/days/${dayNumber}/stops/${stopId}`);
  },

  /**
   * 10. Thay đổi thứ tự địa điểm (Kéo thả)
   */
  moveStop: async (payload: { journey_id: string; from_day_number: number; to_day_number: number; old_index: number; new_index: number }): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${payload.journey_id}/move-stop`, payload);
  },

  // ==========================================
  // TRACKING & CHECK-IN
  // ==========================================

  startJourney: async (id: string): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/start`);
  },

  /**
   * Điểm danh vật lý (Đã bỏ actual_cost ra khỏi logic check-in)
   */
  checkInStop: async (journeyId: string, dayId: string, stopId: string, data: { check_in_image?: string }): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}/check-in`, data);
  },

  skipStop: async (journeyId: string, dayId: string, stopId: string): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}/skip`);
  },

  /**
   * Ghi nhận chi tiêu ngoài lịch trình (Ví dụ: mua nước, đổ xăng chung)
   */
  addExtraExpense: async (journeyId: string, data: { title: string, amount: number }): Promise<Journey> => {
    return await apiClient.post(`/journeys/${journeyId}/expenses`, data);
  },

  // ==========================================
  // SOCIAL & MEMBERS
  // ==========================================

  joinByInviteCode: async (invite_code: string): Promise<Journey> => {
    return await apiClient.post('/journeys/join', { invite_code });
  },

  leaveJourney: async (id: string): Promise<any> => {
    return await apiClient.post(`/journeys/${id}/leave`);
  },

  getAlbum: async (id: string): Promise<any[]> => {
    return await apiClient.get(`/journeys/${id}/album`);
  },

  getBudgetBreakdown: async (id: string): Promise<any> => {
    return await apiClient.get(`/journeys/${id}/budget-breakdown`);
  }
};