export enum FriendStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED'
}

export interface FriendUser {
  _id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

export interface FriendRequest {
  id: string; // ID của bản ghi Friendship
  requester_id: string;
  recipient_id: string;
  status: FriendStatus;
  created_at: string;
  sender: {
    _id: string;
    fullName: string;
    avatar: string | null;
  } | null;
}

// DTO Payloads
export interface SendFriendRequestPayload {
  target_user_id: string;
}

export interface RespondFriendRequestPayload {
  status: FriendStatus.ACCEPTED | FriendStatus.REJECTED;
}