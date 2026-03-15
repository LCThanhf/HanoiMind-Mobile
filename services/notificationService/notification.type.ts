// notificationService/notification.type.ts

export enum NotificationType {
  SYSTEM = 'SYSTEM',             // Thông báo hệ thống
  GROUP_INVITE = 'GROUP_INVITE', // Mời vào nhóm
  JOURNEY_UPDATE = 'JOURNEY_UPDATE', // Lịch trình thay đổi
  NEW_MESSAGE = 'NEW_MESSAGE',   // Tin nhắn mới
  PAYMENT = 'PAYMENT'            // Nhắc nợ/Thanh toán
}

export interface Notification {
  _id: string;
  recipient_id: string;
  sender_id?: string;
  sender_avatar?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any; 
  is_read: boolean;
  created_at: string;
}

export interface NotificationState {
  unread_count: number;
  notifications: Notification[];
}