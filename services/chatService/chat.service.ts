import { io, Socket } from 'socket.io-client';
import apiClient from '../apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, ChatConversation, SendMessagePayload } from './chat.type';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sybausuzuka-berotravel-backend.hf.space/api/v1/';
const SOCKET_URL = API_URL.replace('/api/v1/', '') + '/chat';

class ChatService {
  private socket: Socket | null = null;

  private normalizeConversation(raw: any): ChatConversation {
    const resolvedId = raw?._id || raw?.room_id || raw?.id;
    return {
      ...raw,
      _id: resolvedId,
      id: raw?.id,
      room_id: raw?.room_id,
    } as ChatConversation;
  }

  // ==========================================
  // 1. API CALLS (REST)
  // ==========================================

  async getConversations(): Promise<ChatConversation[]> {
    try {
      const data = await apiClient.get('/chat/conversations');
      if (!Array.isArray(data)) {
        return [];
      }
      return data
        .map((item: any) => this.normalizeConversation(item))
        .filter((item) => Boolean(item._id));
    } catch (error) {
      throw error;
    }
  }

  /** Lấy lịch sử tin nhắn trong phòng */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      return await apiClient.get(`/chat/history/${roomId}`);
    } catch (error) {
      throw error;
    }
  }

  /** [MỚI BỔ SUNG] Tạo hoặc lấy phòng chat 1-1 */
  async createDirectChat(receiverId: string): Promise<ChatConversation> {
    try {
      const data = await apiClient.post('/chat/direct', { receiver_id: receiverId });
      const conversation = this.normalizeConversation(data);
      if (!conversation._id) {
        throw new Error('Phản hồi tạo phòng chat không có room id hợp lệ');
      }
      return conversation;
    } catch (error) {
      throw error;
    }
  }

  /** Lấy kho ảnh của phòng chat */
  async getRoomImages(roomId: string): Promise<ChatMessage[]> {
    try {
      return await apiClient.get(`/chat/${roomId}/images`);
    } catch (error) {
      throw error;
    }
  }

  /** Tìm kiếm tin nhắn */
  async searchMessages(roomId: string, keyword: string): Promise<ChatMessage[]> {
    try {
      return await apiClient.get(`/chat/${roomId}/search`, { params: { keyword } });
    } catch (error) {
      throw error;
    }
  }

  async getPolls(roomId: string): Promise<any[]> {
    try {
      // Endpoint này thường trả về danh sách các tin nhắn có type là 'POLL'
      // Hoặc một bảng Poll riêng biệt tùy theo thiết kế Backend của bạn
      return await apiClient.get(`/chat/${roomId}/polls`);
    } catch (error) {
      console.error('Lỗi lấy danh sách Poll:', error);
      return []; // Trả về mảng rỗng nếu lỗi để tránh crash UI
    }
  }

  // ==========================================
  // 2. SOCKET LOGIC (Thời gian thực)
  // ==========================================

  /** Khởi tạo kết nối Socket */
  async connect() {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token || this.socket) return;

    this.socket = io(SOCKET_URL, {
      query: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Chat Socket');
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Chat Socket Error:', err.message);
    });
  }

  /** Tham gia vào phòng chat (Journey hoặc Direct) */
  joinRoom(params: { room_id?: string; journey_id?: string }): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket chưa được khởi tạo'));
      }

      // 1. Gửi yêu cầu join room
      this.socket.emit('join_room', params);

      // 2. Lắng nghe phản hồi thành công một lần duy nhất
      this.socket.once('room_joined_success', (data: { room_id: string }) => {
        this.socket?.off('error'); // Hủy lắng nghe lỗi nếu thành công
        resolve(data.room_id);
      });

      // 3. Lắng nghe phản hồi lỗi một lần duy nhất
      this.socket.once('error', (err: { message: string }) => {
        this.socket?.off('room_joined_success'); // Hủy lắng nghe thành công nếu lỗi
        reject(new Error(err.message));
      });

      // 4. Timeout (Tùy chọn) để tránh treo UI nếu server không phản hồi
      setTimeout(() => {
        this.socket?.off('room_joined_success');
        this.socket?.off('error');
        reject(new Error('Kết nối phòng chat quá hạn (Timeout)'));
      }, 5000);
    });
  }

  /** Gửi tin nhắn mới */
  sendMessage(payload: SendMessagePayload) {
    this.socket?.emit('send_message', payload);
  }

  /** Thả cảm xúc tin nhắn */
  reactMessage(messageId: string, roomId: string, emoji: string) {
    this.socket?.emit('react_message', { message_id: messageId, room_id: roomId, emoji });
  }

  /** Bình chọn Poll */
  votePoll(messageId: string, roomId: string, optionId: string) {
    this.socket?.emit('vote_poll', { message_id: messageId, room_id: roomId, option_id: optionId });
  }

  /** Lắng nghe tin nhắn mới */
  onReceiveMessage(callback: (msg: ChatMessage) => void) {
    this.socket?.on('receive_message', callback);
  }

  /** Lắng nghe cập nhật cảm xúc/poll */
  onUpdateReaction(callback: (data: any) => void) {
    this.socket?.on('reaction_updated', callback);
  }

  onUpdatePoll(callback: (data: any) => void) {
    this.socket?.on('poll_updated', callback);
  }

  /** Lắng nghe thông báo tin nhắn mới toàn cục (popup) */
  onNewMessageAlert(callback: (msg: ChatMessage) => void) {
    this.socket?.on('new_message_alert', callback);
  }

  /** Ngắt kết nối */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new ChatService();