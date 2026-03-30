// aiService/ai.service.ts

import { aiApiClient } from '../apiClient';
import {
  AiDayPlan,
  AIPlanRequest,
  AIPlanResponse,
  AiStop,
  AiProposal,
  CreateJourneyFromRelatedRequest,
  CreateJourneyFromRelatedResponse,
  RequestAiPlanPayload,
  SuggestNextParams
} from './ai.type';

const HOTEL_CATEGORIES = new Set(['HOTEL', 'ACCOMMODATION', 'HOSTEL', 'HOMESTAY', 'RESORT', 'GUEST_HOUSE']);
const HOTEL_NAME_HINTS = ['hotel', 'resort', 'hostel', 'homestay', 'guest house', 'khach san'];

const isHotelStop = (stop: AiStop) => {
  const category = String(stop.category || '').toUpperCase();
  if (stop.is_hotel_anchor === true) return true;
  if (HOTEL_CATEGORIES.has(category)) return true;

  const placeName = String(stop.place_name || '').toLowerCase();
  return HOTEL_NAME_HINTS.some((hint) => placeName.includes(hint));
};

const normalizeAiDays = (days?: AiDayPlan[] | null): AiDayPlan[] | null | undefined => {
  if (days === null || days === undefined) return days;

  const normalizedDays = days.map((day) => ({
    ...day,
    stops: (day.stops || []).map((stop) => ({ ...stop })),
  }));

  const hotelStopsByPlaceId = new Map<string, Array<{ dayIndex: number; stopIndex: number; stop: AiStop }>>();

  normalizedDays.forEach((day, fallbackDayIndex) => {
    const dayIndex = typeof day.day_number === 'number' ? Math.max(0, day.day_number - 1) : fallbackDayIndex;
    day.stops.forEach((stop, stopIndex) => {
      if (!isHotelStop(stop)) return;

      const placeId = String(stop.place_id || '').trim();
      if (!placeId) return;

      const bucket = hotelStopsByPlaceId.get(placeId) || [];
      bucket.push({ dayIndex, stopIndex, stop });
      hotelStopsByPlaceId.set(placeId, bucket);
    });
  });

  hotelStopsByPlaceId.forEach((bucket) => {
    bucket.sort((left, right) => {
      if (left.dayIndex !== right.dayIndex) {
        return left.dayIndex - right.dayIndex;
      }

      const leftOrder = typeof left.stop.order === 'number' ? left.stop.order : left.stopIndex;
      const rightOrder = typeof right.stop.order === 'number' ? right.stop.order : right.stopIndex;
      return leftOrder - rightOrder;
    });

    const first = bucket[0];
    const last = bucket[bucket.length - 1];

    first.stop.checkin_day_index = first.dayIndex;
    first.stop.checkin_time = first.stop.start_time ?? first.stop.end_time ?? null;
    first.stop.is_hotel_anchor = true;

    last.stop.checkout_day_index = last.dayIndex;
    last.stop.checkout_time = last.stop.end_time ?? last.stop.start_time ?? null;
    last.stop.is_hotel_anchor = true;
  });

  return normalizedDays;
};

const normalizeAiPlanResponse = (response: AIPlanResponse): AIPlanResponse => ({
  ...response,
  days: normalizeAiDays(response.days) || response.days,
});

const normalizeCreateJourneyFromRelatedResponse = (
  response: CreateJourneyFromRelatedResponse
): CreateJourneyFromRelatedResponse => ({
  ...response,
  days: normalizeAiDays(response.days) ?? response.days,
});

const normalizeProposal = (proposal: AiProposal): AiProposal => ({
  ...proposal,
  days: normalizeAiDays(proposal.days) || proposal.days,
});

const ensureAiBackendConfigured = () => {
  const baseUrl = aiApiClient.defaults.baseURL;
  if (!baseUrl || !String(baseUrl).trim()) {
    throw new Error('Thiếu cấu hình EXPO_PUBLIC_AI_API_URL để kết nối AI backend.');
  }
};

export const AiService = {
  /**
   * Tạo hành trình bằng nguồn AI related places.
   */
  createJourneyFromRelated: async (
    payload: CreateJourneyFromRelatedRequest
  ): Promise<CreateJourneyFromRelatedResponse> => {
    try {
      ensureAiBackendConfigured();
      const response = await aiApiClient.post('/journeys/auto-create-related', payload);
      return normalizeCreateJourneyFromRelatedResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Chạy tối ưu AI theo endpoint mới /ai-plan.
   */
  runAiPlan: async (journeyId: string, payload: AIPlanRequest): Promise<AIPlanResponse> => {
    try {
      ensureAiBackendConfigured();
      const response = await aiApiClient.post(`/journeys/${journeyId}/ai-plan`, payload);
      return normalizeAiPlanResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1. Yêu cầu AI lập kế hoạch cho một hành trình
   */
  createPlan: async (journeyId: string, payload: RequestAiPlanPayload): Promise<AiProposal> => {
    try {
      const response = await aiApiClient.post(`/ai/planning/plan/${journeyId}`, payload);
      return normalizeProposal(response);
    } catch (error) { throw error; }
  },

  /**
   * 2. Lấy danh sách lịch sử các bản nháp AI của hành trình
   */
  getProposals: async (journeyId: string): Promise<AiProposal[]> => {
    try {
      const response = await aiApiClient.get(`/ai/planning/proposals/journey/${journeyId}`);
      return (response || []).map(normalizeProposal);
    } catch (error) { throw error; }
  },

  /**
   * 3. Xem chi tiết một bản nháp cụ thể
   */
  getProposalDetail: async (proposalId: string): Promise<AiProposal> => {
    try {
      const response = await aiApiClient.get(`/ai/planning/proposal/${proposalId}`);
      return normalizeProposal(response);
    } catch (error) { throw error; }
  },

  /**
   * 4. Đổi một điểm trong nháp bằng một điểm từ danh sách dự phòng (Candidate Pool)
   */
  swapPlace: async (proposalId: string, data: { dayNumber: number; oldPlaceId: string; newPlaceId: string }): Promise<AiProposal> => {
    try {
      const response = await aiApiClient.patch(`/ai/planning/proposal/${proposalId}/swap`, data);
      return normalizeProposal(response);
    } catch (error) { throw error; }
  },

  /**
   * 5. Chấp nhận bản nháp (Áp dụng lịch trình AI vào hành trình chính)
   */
  acceptProposal: async (proposalId: string): Promise<{ success: boolean }> => {
    try {
      return await aiApiClient.post(`/ai/planning/accept/${proposalId}`);
    } catch (error) { throw error; }
  },

  /**
   * 6. Tối ưu hóa lại thứ tự đường đi cho một ngày cụ thể
   */
  optimizeDay: async (journeyId: string, dayNumber: number): Promise<any> => {
    try {
      return await aiApiClient.post(`/ai/planning/optimize/${journeyId}/${dayNumber}`);
    } catch (error) { throw error; }
  },

  /**
   * 7. Gợi ý các địa điểm tiếp theo dựa trên vị trí hiện tại của hành trình
   */
  suggestNextPlaces: async (journeyId: string, params: SuggestNextParams): Promise<any> => {
    try {
      return await aiApiClient.post(`/ai/planning/journey/${journeyId}/suggest-next`, params);
    } catch (error) { throw error; }
  }
};