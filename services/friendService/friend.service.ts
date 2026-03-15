import apiClient from '../apiClient';
import { 
  FriendUser, 
  FriendRequest, 
  SendFriendRequestPayload, 
  RespondFriendRequestPayload 
} from './friend.type';

export const FriendService = {
  /**
   * 1. Gửi lời mời kết bạn
   */
  sendRequest: async (payload: SendFriendRequestPayload): Promise<any> => {
    try {
      return await apiClient.post('/friends/request', payload);
    } catch (error) { throw error; }
  },

  /**
   * 2. Xem danh sách lời mời kết bạn đang chờ (Received)
   */
  getPendingRequests: async (): Promise<FriendRequest[]> => {
    try {
      return await apiClient.get('/friends/requests/received');
    } catch (error) { throw error; }
  },

  /**
   * 3. Chấp nhận hoặc Từ chối lời mời
   * @param friendshipId ID của bản ghi lời mời
   */
  respondRequest: async (friendshipId: string, payload: RespondFriendRequestPayload): Promise<any> => {
    try {
      return await apiClient.patch(`/friends/requests/${friendshipId}/respond`, payload);
    } catch (error) { throw error; }
  },

  /**
   * 4. Lấy danh sách bạn bè đã kết bạn (ACCEPTED)
   */
  getMyFriends: async (): Promise<FriendUser[]> => {
    try {
      return await apiClient.get('/friends');
    } catch (error) { throw error; }
  },

  /**
   * 5. Hủy kết bạn
   * @param targetId ID của người bạn cần hủy kết bạn
   */
  unfriend: async (targetId: string): Promise<any> => {
    try {
      return await apiClient.delete(`/friends/${targetId}`);
    } catch (error) { throw error; }
  },

  /**
   * 6. Chặn người dùng
   */
  blockUser: async (targetId: string): Promise<any> => {
    try {
      return await apiClient.post(`/friends/block/${targetId}`);
    } catch (error) { throw error; }
  },

  /**
   * 7. Gỡ chặn người dùng
   */
  unblockUser: async (targetId: string): Promise<any> => {
    try {
      return await apiClient.delete(`/friends/unblock/${targetId}`);
    } catch (error) { throw error; }
  }
};