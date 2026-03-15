// src/services/journeyService/journey.service.ts

import apiClient from '../apiClient';
import { 
  Journey, 
  CreateJourneyPayload, 
  AddStopPayload,
  JourneyStatus 
} from './journey.type';

export const JourneyService = {
  /**
   * 1. Tạo hành trình mới
   */
  create: async (payload: CreateJourneyPayload): Promise<Journey> => {
    try {
      return await apiClient.post('/journeys', payload);
    } catch (error) { throw error; }
  },

  /**
   * 2. Lấy danh sách hành trình của tôi
   */
  findMy: async (): Promise<Journey[]> => {
    try {
      return await apiClient.get('/journeys/my-journeys');
    } catch (error) { throw error; }
  },

  /**
   * 3. Lấy danh sách hành trình công khai (Feed)
   */
  getPublicFeed: async (search?: string): Promise<Journey[]> => {
    try {
      return await apiClient.get('/journeys/public', { params: { search } });
    } catch (error) { throw error; }
  },

  /**
   * 4. Xem chi tiết hành trình
   */
  findOne: async (id: string): Promise<Journey> => {
    try {
      return await apiClient.get(`/journeys/${id}`);
    } catch (error) { throw error; }
  },

  /**
   * 5. Thêm địa điểm vào lịch trình
   */
  addStop: async (id: string, payload: AddStopPayload): Promise<Journey> => {
    try {
      return await apiClient.patch(`/journeys/${id}/add-stop`, payload);
    } catch (error) { throw error; }
  },

  /**
   * 6. Cập nhật thông tin điểm dừng (Stop)
   */
  updateStop: async (journeyId: string, dayId: string, stopId: string, payload: any): Promise<Journey> => {
    try {
      return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}`, payload);
    } catch (error) { throw error; }
  },

  /**
   * 7. Xóa một địa điểm khỏi lịch trình
   */
  removeStop: async (id: string, dayNumber: number, stopId: string): Promise<any> => {
    try {
      return await apiClient.delete(`/journeys/${id}/days/${dayNumber}/stops/${stopId}`);
    } catch (error) { throw error; }
  },

  /**
   * 8. Thay đổi thứ tự địa điểm (Kéo thả)
   */
  moveStop: async (payload: { journey_id: string; from_day_number: number; to_day_number: number; old_index: number; new_index: number }): Promise<Journey> => {
    try {
      return await apiClient.patch(`/journeys/${payload.journey_id}/move-stop`, payload);
    } catch (error) { throw error; }
  },

  // ==========================================
  // TRACKING & CHECK-IN
  // ==========================================

  startJourney: async (id: string): Promise<Journey> => {
    try { return await apiClient.patch(`/journeys/${id}/start`); } catch (error) { throw error; }
  },

  checkInStop: async (journeyId: string, dayId: string, stopId: string, data: { actual_cost?: number, check_in_image?: string }): Promise<Journey> => {
    try {
      return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}/check-in`, data);
    } catch (error) { throw error; }
  },

  skipStop: async (journeyId: string, dayId: string, stopId: string): Promise<Journey> => {
    try {
      return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}/skip`);
    } catch (error) { throw error; }
  },

  // ==========================================
  // SOCIAL & MEMBERS
  // ==========================================

  /**
   * Tham gia hành trình bằng mã mời
   */
  joinByInviteCode: async (invite_code: string): Promise<Journey> => {
    try {
      return await apiClient.post('/journeys/join', { invite_code });
    } catch (error) { throw error; }
  },

  /**
   * Rời khỏi hành trình
   */
  leaveJourney: async (id: string): Promise<any> => {
    try {
      return await apiClient.post(`/journeys/${id}/leave`);
    } catch (error) { throw error; }
  },

  /**
   * Lấy Album ảnh (Check-in + Chat) của hành trình
   */
  getAlbum: async (id: string): Promise<any[]> => {
    try {
      return await apiClient.get(`/journeys/${id}/album`);
    } catch (error) { throw error; }
  },

  /**
   * Lấy phân tích ngân sách chi tiết
   */
  getBudgetBreakdown: async (id: string): Promise<any> => {
    try {
      return await apiClient.get(`/journeys/${id}/budget-breakdown`);
    } catch (error) { throw error; }
  }
};