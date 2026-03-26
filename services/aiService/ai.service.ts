// aiService/ai.service.ts

import { aiApiClient } from '../apiClient';
import {
  AIPlanRequest,
  AIPlanResponse,
  AiProposal,
  CreateJourneyFromRelatedRequest,
  CreateJourneyFromRelatedResponse,
  RequestAiPlanPayload,
  SuggestNextParams
} from './ai.type';

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
      return await aiApiClient.post('/journeys/auto-create-related', payload);
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
      return await aiApiClient.post(`/journeys/${journeyId}/ai-plan`, payload);
    } catch (error) {
      throw error;
    }
  },

  /**
   * 1. Yêu cầu AI lập kế hoạch cho một hành trình
   */
  createPlan: async (journeyId: string, payload: RequestAiPlanPayload): Promise<AiProposal> => {
    try {
      return await aiApiClient.post(`/ai/planning/plan/${journeyId}`, payload);
    } catch (error) { throw error; }
  },

  /**
   * 2. Lấy danh sách lịch sử các bản nháp AI của hành trình
   */
  getProposals: async (journeyId: string): Promise<AiProposal[]> => {
    try {
      return await aiApiClient.get(`/ai/planning/proposals/journey/${journeyId}`);
    } catch (error) { throw error; }
  },

  /**
   * 3. Xem chi tiết một bản nháp cụ thể
   */
  getProposalDetail: async (proposalId: string): Promise<AiProposal> => {
    try {
      return await aiApiClient.get(`/ai/planning/proposal/${proposalId}`);
    } catch (error) { throw error; }
  },

  /**
   * 4. Đổi một điểm trong nháp bằng một điểm từ danh sách dự phòng (Candidate Pool)
   */
  swapPlace: async (proposalId: string, data: { dayNumber: number; oldPlaceId: string; newPlaceId: string }): Promise<AiProposal> => {
    try {
      return await aiApiClient.patch(`/ai/planning/proposal/${proposalId}/swap`, data);
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