import { io, Socket } from 'socket.io-client';
import apiClient from '../apiClient';
import { Notification, NotificationType } from './notification.type';

let socket: Socket | null = null;

export const NotificationService = {
  /**
   * 1. Khởi tạo kết nối Socket cho thông báo (Real-time)
   */
  connectSocket: (token: string, onNewNotification: (notif: Notification) => void) => {
    if (socket) return;

    // Kết nối tới namespace /notifications đã định nghĩa ở Backend
    socket = io(`https://sybausuzuka-berotravel-backend.hf.space/notifications`, {
      query: { token },
      transports: ['websocket'],
    });

    // Lắng nghe sự kiện 'new_notification' từ Gateway
    socket.on('new_notification', (notification: Notification) => {
      onNewNotification(notification);
    });

    socket.on('connect', () => console.log('Connected to Notification Socket'));
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * 2. Lấy danh sách thông báo cá nhân
   */
  getMyNotifications: async (): Promise<Notification[]> => {
    try {
      return await apiClient.get('/notifications');
    } catch (error) { throw error; }
  },

  /**
   * 3. Đánh dấu một thông báo là đã đọc
   */
  markAsRead: async (id: string): Promise<Notification> => {
    try {
      return await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) { throw error; }
  },

  /**
   * 4. Đánh dấu tất cả là đã đọc
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      return await apiClient.patch('/notifications/read-all');
    } catch (error) { throw error; }
  }
};