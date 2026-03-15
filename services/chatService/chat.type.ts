export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LOCATION = 'LOCATION',
  POLL = 'POLL',
  SYSTEM = 'SYSTEM'
}

export enum ConversationType {
  DIRECT = 'DIRECT',
  JOURNEY = 'JOURNEY'
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface ChatMessage {
  _id: string;
  room_id: string;
  room_type: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  type: MessageType;
  reactions: MessageReaction[];
  metadata?: any;
  reply_to_id?: string;
  created_at: string;
  // Thông tin sender được populate từ aggregate backend
  sender?: {
    id: string;
    fullName: string;
    avatar: string;
  };
}

export interface ChatConversation {
  _id: string;
  type: ConversationType;
  participant_ids: string[];
  journey_id?: string;
  last_message?: string;
  updated_at: string;
}

export interface SendMessagePayload {
  room_id?: string;
  journey_id?: string;
  receiver_id?: string;
  content?: string;
  type: MessageType;
  metadata?: any;
  reply_to_id?: string;
}