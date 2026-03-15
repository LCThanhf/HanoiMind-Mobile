// journeyService/journey-draft.service.ts
import apiClient from '../apiClient';
import { JourneyDraft, SwapPlacePayload } from './journey-draft.type';
import { Journey } from './journey.type';

export const JourneyDraftService = {
  /**
   * 1. Lấy danh sách các bản nháp của một hành trình
   * Tương ứng: GET /ai/planning/proposals/journey/:journeyId
   */
  getDraftsByJourney: async (journeyId: string): Promise<JourneyDraft[]> => {
    try {
      return await apiClient.get(`/ai/planning/proposals/journey/${journeyId}`);
    } catch (error) { throw error; }
  },

  /**
   * 2. Xem chi tiết một bản nháp cụ thể
   * Tương ứng: GET /ai/planning/proposal/:id
   */
  getDraftDetail: async (draftId: string): Promise<JourneyDraft> => {
    try {
      return await apiClient.get(`/ai/planning/proposal/${draftId}`);
    } catch (error) { throw error; }
  },

  /**
   * 3. Thay đổi một địa điểm trong bản nháp bằng địa điểm dự phòng
   * Giúp người dùng tùy chỉnh bản nháp mà không cần chạy lại AI
   * Tương ứng: PATCH /ai/planning/proposal/:id/swap
   */
  swapPlaceInDraft: async (draftId: string, payload: SwapPlacePayload): Promise<JourneyDraft> => {
    try {
      return await apiClient.patch(`/ai/planning/proposal/${draftId}/swap`, payload);
    } catch (error) { throw error; }
  },

  /**
   * 4. Chấp nhận bản nháp (Chuyển nháp thành lịch trình chính thức)
   * Thao tác này sẽ ghi đè dữ liệu vào Journey gốc
   * Tương ứng: POST /ai/planning/accept/:id
   */
  acceptDraft: async (draftId: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.post(`/ai/planning/accept/${draftId}`);
    } catch (error) { throw error; }
  },

  /**
   * 5. Xóa bản nháp không dùng tới
   */
  deleteDraft: async (draftId: string): Promise<any> => {
    try {
      return await apiClient.delete(`/ai/planning/proposal/${draftId}`);
    } catch (error) { throw error; }
  }
};