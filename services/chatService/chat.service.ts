import { io, Socket } from 'socket.io-client';
import apiClient from '../apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, ChatConversation, SendMessagePayload } from './chat.type';

// URL của Backend 
const SOCKET_URL = 'https://sybausuzuka-berotravel-backend.hf.space/chat'; 

class ChatService {
  private socket: Socket | null = null;

  async getConversations(): Promise<ChatConversation[]> {
    return await apiClient.get('/chat/conversations');
  }

  /** Lấy lịch sử tin nhắn trong phòng */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    return await apiClient.get(`/chat/history/${roomId}`);
  }

  /** Lấy kho ảnh của phòng chat */
  async getRoomImages(roomId: string): Promise<ChatMessage[]> {
    return await apiClient.get(`/chat/${roomId}/images`);
  }

  /** Tìm kiếm tin nhắn */
  async searchMessages(roomId: string, keyword: string): Promise<ChatMessage[]> {
    return await apiClient.get(`/chat/${roomId}/search`, { params: { keyword } });
  }

  // ==========================================
  // 2. SOCKET LOGIC (Thời gian thực)
  // ==========================================

  /** Khởi tạo kết nối Socket */
  async connect() {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      query: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Chat Socket');
    });

    this.socket.on('error', (err) => {
      console.error('❌ Socket Error:', err);
    });
  }

  /** Tham gia vào phòng chat (Journey hoặc Direct) */
  joinRoom(params: { room_id?: string; journey_id?: string }) {
    this.socket?.emit('join_room', params);
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