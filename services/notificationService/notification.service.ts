import { io, Socket } from 'socket.io-client';
import apiClient from '../apiClient';
import { Notification } from './notification.type';

let socket: Socket | null = null;
const listeners = new Set<(notif: Notification) => void>();

// Lấy Base URL từ env và xử lý để lấy domain cho Socket
// Thường Socket sẽ nối vào domain chính (bỏ phần /api/v1/)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sybausuzuka-berotravel-backend.hf.space/api/v1/';
const SOCKET_URL = API_URL.replace('/api/v1/', ''); 

export const NotificationService = {
  /**
   * 1. Khởi tạo kết nối Socket cho thông báo (Real-time)
   */
  connectSocket: (token: string, onNewNotification?: (notif: Notification) => void) => {
    if (onNewNotification) {
      listeners.add(onNewNotification);
    }

    if (socket) return;

    // Kết nối tới namespace /notifications đã định nghĩa ở Backend
    socket = io(`${SOCKET_URL}/notifications`, {
      query: { token },
      transports: ['websocket'],
    });

    // Lắng nghe sự kiện 'new_notification' từ Gateway
    socket.on('new_notification', (notification: Notification) => {
      listeners.forEach((listener) => listener(notification));
    });

    socket.on('connect', () => console.log('Connected to Notification Socket'));
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  },

  /**
   * Đăng ký lắng nghe thông báo realtime
   */
  subscribe: (listener: (notif: Notification) => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Ngắt kết nối Socket
   */
  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    listeners.clear();
  },

  /**
   * 2. Lấy danh sách thông báo cá nhân
   */
  getMyNotifications: async (): Promise<Notification[]> => {
    try {
      return await apiClient.get('/notifications');
    } catch (error) { 
      throw error; 
    }
  },

  /**
   * 3. Đánh dấu một thông báo là đã đọc
   */
  markAsRead: async (id: string): Promise<Notification> => {
    try {
      return await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) { 
      throw error; 
    }
  },

  /**
   * 4. Đánh dấu tất cả là đã đọc
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      return await apiClient.patch('/notifications/read-all');
    } catch (error) { 
      throw error; 
    }
  }
};