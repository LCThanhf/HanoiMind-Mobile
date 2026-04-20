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

const shouldFallbackToPathStyleJourneyEndpoint = (error: any): boolean => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      ''
  ).toLowerCase();

  if (status === 404 || status === 405 || status === 501) {
    return true;
  }

  return (
    message.includes('cannot post') ||
    message.includes('cannot patch') ||
    message.includes('cannot delete') ||
    message.includes('not found') ||
    message.includes('method not allowed')
  );
};

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
    try {
      return await apiClient.patch(`/journeys/${id}/add-stop`, payload);
    } catch (error) {
      if (!shouldFallbackToPathStyleJourneyEndpoint(error)) {
        throw error;
      }

      const dayNumber = Math.max(1, Number(payload.day_index || 0) + 1);
      const { place_id, day_index: _dayIndex, ...body } = payload;
      return await apiClient.post(`/journeys/${id}/days/${dayNumber}/stops/${place_id}`, body);
    }
  },

  updateStop: async (journeyId: string, dayId: string, stopId: string, payload: UpdateStopPayload): Promise<Journey> => {
    return await apiClient.patch(`/journeys/${journeyId}/days/${dayId}/stops/${stopId}`, payload);
  },

  removeStop: async (id: string, dayNumber: number, stopId: string, placeId?: string): Promise<any> => {
    try {
      return await apiClient.delete(`/journeys/${id}/days/${dayNumber}/stops/${stopId}`);
    } catch (error) {
      if (!shouldFallbackToPathStyleJourneyEndpoint(error) || !placeId) {
        throw error;
      }

      return await apiClient.delete(`/journeys/${id}/days/${dayNumber}/stops/${placeId}`);
    }
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
    const normalizedInviteCode = typeof invite_code === 'string' ? invite_code.trim() : '';
    if (!normalizedInviteCode) {
      throw new Error('invite_code is required');
    }

    return await apiClient.post('/journeys/join', { invite_code: normalizedInviteCode });
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
