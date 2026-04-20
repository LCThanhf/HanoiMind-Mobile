// aiService/ai.service.ts

import apiClient, { aiApiClient } from '../apiClient';
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

type ApiClientLike = {
  defaults?: {
    baseURL?: string;
  };
  post: (url: string, data?: unknown) => Promise<any>;
  get: (url: string) => Promise<any>;
  patch: (url: string, data?: unknown) => Promise<any>;
};

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

  const hotelStopsByPlaceId = new Map<string, { dayIndex: number; stopIndex: number; stop: AiStop }[]>();

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

const toLegacyMood = (payload: AIPlanRequest): string => {
  if (payload.mood) return payload.mood;

  const entries = Object.entries(payload.mood_distribution || {}).sort((left, right) => {
    const leftWeight = typeof left[1] === 'number' ? left[1] : 0;
    const rightWeight = typeof right[1] === 'number' ? right[1] : 0;
    return rightWeight - leftWeight;
  });

  return (entries[0]?.[0] as string) || 'NATURE_EXPLORE';
};

const toLegacyPlanPayload = (payload: AIPlanRequest): RequestAiPlanPayload => ({
  total_days: payload.total_days,
  mode: payload.mode || 'solo',
  mood: toLegacyMood(payload),
  mood_distribution: payload.mood_distribution ? { ...payload.mood_distribution } : undefined,
  total_budget_vnd: payload.total_budget_vnd,
  daily_budget_vnd: payload.daily_budget_vnd,
  hours_per_day: payload.hours_per_day,
  travel_style: payload.travel_style || 'balanced',
  max_places_per_day: payload.max_places_per_day,
  must_include_categories: payload.must_include_categories,
  exclude_categories: payload.exclude_categories,
});

const proposalToAiPlanResponse = (journeyId: string, proposal: AiProposal): AIPlanResponse => {
  const normalizedDays = normalizeAiDays(proposal.days) || proposal.days || [];

  return {
    journey_id: proposal.journey_id || journeyId,
    journey_name: proposal.journey_id || journeyId,
    total_days: normalizedDays.length,
    mode: 'solo',
    mood_used: (proposal.mood_used as any) || null,
    mood_distribution_used: null,
    total_budget_vnd: proposal.total_budget_vnd || 0,
    daily_budget_vnd:
      normalizedDays.length > 0 ? Math.floor((proposal.total_budget_vnd || 0) / normalizedDays.length) : proposal.total_budget_vnd || 0,
    generated_at: proposal.createdAt || new Date().toISOString(),
    candidate_pool_size: Array.isArray(proposal.candidate_pool) ? proposal.candidate_pool.length : 0,
    generation_time_ms: 0,
    days: normalizedDays,
    candidate_pool: proposal.candidate_pool || [],
    planning_notes: proposal.planning_notes || [],
  };
};

const shouldFallbackToLegacyPlanEndpoint = (error: any): boolean => {
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
    message.includes('not found') ||
    message.includes('method not allowed')
  );
};

const shouldFallbackToMainJourneyBackend = (error: any): boolean => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    ''
  ).toLowerCase();

  if (status === 404 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  return (
    message.includes('cannot post') ||
    message.includes('internal server error') ||
    message.includes('journey not found') ||
    message.includes('not found')
  );
};

const normalizeBaseUrl = (value: string | undefined): string => String(value || '').trim().replace(/\/+$/, '');

const usesSeparateAiBackend = () => normalizeBaseUrl(aiApiClient.defaults?.baseURL) !== normalizeBaseUrl(apiClient.defaults?.baseURL);

const ensureBackendConfigured = (client: ApiClientLike) => {
  const baseUrl = client.defaults?.baseURL;
  if (!baseUrl || !String(baseUrl).trim()) {
    throw new Error('Thiếu cấu hình URL backend để kết nối AI service.');
  }
};

const runAiPlanWithClient = async (
  client: ApiClientLike,
  journeyId: string,
  payload: AIPlanRequest
): Promise<AIPlanResponse> => {
  const response = await client.post(`/journeys/${journeyId}/ai-plan`, payload);
  return normalizeAiPlanResponse(response);
};

const createPlanWithClient = async (
  client: ApiClientLike,
  journeyId: string,
  payload: RequestAiPlanPayload
): Promise<AiProposal> => {
  const response = await client.post(`/ai/planning/plan/${journeyId}`, payload);
  return normalizeProposal(response);
};

const acceptProposalWithClient = async (client: ApiClientLike, proposalId: string): Promise<{ success: boolean }> =>
  client.post(`/ai/planning/accept/${proposalId}`);

const runLegacyProposalFlow = async (
  client: ApiClientLike,
  journeyId: string,
  payload: AIPlanRequest
): Promise<AIPlanResponse> => {
  const legacyProposal = await createPlanWithClient(client, journeyId, toLegacyPlanPayload(payload));
  await acceptProposalWithClient(client, legacyProposal._id);
  return proposalToAiPlanResponse(journeyId, legacyProposal);
};

const castResponseData = <T>(value: unknown): T => value as T;

const ensureAiBackendConfigured = () => {
  ensureBackendConfigured(aiApiClient);
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
      return normalizeCreateJourneyFromRelatedResponse(castResponseData<CreateJourneyFromRelatedResponse>(response));
    } catch (error) {
      throw error;
    }
  },

  /**
   * Chạy tối ưu AI theo endpoint mới /ai-plan.
   */
  runAiPlan: async (journeyId: string, payload: AIPlanRequest): Promise<AIPlanResponse> => {
    ensureAiBackendConfigured();

    const hasMainBackendFallback = usesSeparateAiBackend();

    try {
      return await runAiPlanWithClient(aiApiClient, journeyId, payload);
    } catch (aiEndpointError) {
      if (shouldFallbackToLegacyPlanEndpoint(aiEndpointError)) {
        try {
          return await runLegacyProposalFlow(aiApiClient, journeyId, payload);
        } catch (legacyAiError) {
          if (!hasMainBackendFallback || !shouldFallbackToMainJourneyBackend(legacyAiError)) {
            throw legacyAiError;
          }
        }
      } else if (!hasMainBackendFallback || !shouldFallbackToMainJourneyBackend(aiEndpointError)) {
        throw aiEndpointError;
      }
    }

    ensureBackendConfigured(apiClient);

    try {
      return await runAiPlanWithClient(apiClient, journeyId, payload);
    } catch (mainEndpointError) {
      if (!shouldFallbackToLegacyPlanEndpoint(mainEndpointError)) {
        throw mainEndpointError;
      }

      return runLegacyProposalFlow(apiClient, journeyId, payload);
    }
  },

  /**
   * Chạy tối ưu AI theo endpoint cũ /ai/planning/plan/{journeyId}.
   */
  createPlan: async (journeyId: string, payload: RequestAiPlanPayload): Promise<AiProposal> => {
    try {
      const response = await aiApiClient.post(`/ai/planning/plan/${journeyId}`, payload);
      return normalizeProposal(castResponseData<AiProposal>(response));
    } catch (error) {
      throw error;
    }
  },

  /**
   * 2. Lấy danh sách lịch sử các bản nháp AI của hành trình
   */
  getProposals: async (journeyId: string): Promise<AiProposal[]> => {
    try {
      const response = await aiApiClient.get(`/ai/planning/proposals/journey/${journeyId}`);
      return castResponseData<AiProposal[]>(response || []).map(normalizeProposal);
    } catch (error) { throw error; }
  },

  /**
   * 3. Xem chi tiết một bản nháp cụ thể
   */
  getProposalDetail: async (proposalId: string): Promise<AiProposal> => {
    try {
      const response = await aiApiClient.get(`/ai/planning/proposal/${proposalId}`);
      return normalizeProposal(castResponseData<AiProposal>(response));
    } catch (error) { throw error; }
  },

  /**
   * 4. Đổi một điểm trong nháp bằng một điểm từ danh sách dự phòng (Candidate Pool)
   */
  swapPlace: async (proposalId: string, data: { dayNumber: number; oldPlaceId: string; newPlaceId: string }): Promise<AiProposal> => {
    try {
      const response = await aiApiClient.patch(`/ai/planning/proposal/${proposalId}/swap`, data);
      return normalizeProposal(castResponseData<AiProposal>(response));
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
