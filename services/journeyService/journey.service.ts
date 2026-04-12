import apiClient from '../apiClient';
import {
  Journey,
  CreateJourneyPayload,
  UpdateJourneyPayload,
  AddStopPayload,
  GetPublicFeedParams,
  UpdateStopPayload,
  JourneyMood 
} from './journey.type';

export const JourneyService = {
  create: async (payload: CreateJourneyPayload): Promise<Journey> => {
    return await apiClient.post('/journeys', payload);
  },

  findMy: async (): Promise<Journey[]> => {
    return await apiClient.get('/journeys/my-journeys');
  },

  getPublicFeed: async (params: GetPublicFeedParams): Promise<Journey[]> => {
    return await apiClient.get('/journeys/public', { params });
  },

  findOne: async (id: string): Promise<Journey> => {
    return await apiClient.get(`/journeys/${id}`);
  },

  update: async (id: string, payload: UpdateJourneyPayload): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}`, payload);
  },

  /**
   * [MỚI] Gửi bình chọn định hướng/tâm trạng chuyến đi (Mood Vote)
   */
  voteMood: async (id: string, payload: { mood: JourneyMood }): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/mood-vote`, payload);
  },

  remove: async (id: string): Promise<any> => {
    return await apiClient.delete(`/journeys/${id}`);
  },

  addStop: async (id: string, payload: AddStopPayload): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/add-stop`, payload);
  },

  updateStop: async (journeyId: string, dayId: string, stopId: string, payload: UpdateStopPayload): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}`, payload);
  },

  removeStop: async (id: string, dayNumber: number, stopId: string): Promise<any> => {
    return await apiClient.delete(`/journeys/${id}/days/${dayNumber}/stops/${stopId}`);
  },

  moveStop: async (payload: { journey_id: string; from_day_number: number; to_day_number: number; old_index: number; new_index: number }): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${payload.journey_id}/move-stop`, payload);
  },

  // ==========================================
  // TRACKING & CHECK-IN
  // ==========================================

  startJourney: async (id: string): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/start`);
  },

  pauseJourney: async (id: string): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/pause`);
  },

  resumeJourney: async (id: string, payload: { new_start_date: string }): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/resume`, payload);
  },

  cancelJourney: async (id: string): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${id}/cancel`);
  },

  checkInStop: async (journeyId: string, dayId: string, stopId: string, data: { check_in_image?: string }): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}/check-in`, data);
  },

  getCheckInStatus: async (journeyId: string, dayId: string, stopId: string): Promise<any> => {
    return await apiClient.get(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}/check-in-status`);
  },
  
  skipStop: async (journeyId: string, dayId: string, stopId: string): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}/skip`);
  },

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