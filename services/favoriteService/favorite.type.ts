// favoriteService/favorite.type.ts

export enum FavoriteType {
  PLACE = 'PLACE',
  JOURNEY = 'JOURNEY'
}

export interface ToggleFavoritePayload {
  target_id: string; // ID của Place hoặc Journey
  type: FavoriteType;
}

export interface FavoriteResponse {
  status: 'LIKED' | 'UNLIKED';
  message: string;
  count: number; // 1 hoặc -1
}

export interface FriendLikedInfo {
  _id: string;
  fullName: string;
  avatar: string | null;
}

export interface FriendFavoritePlace {
  place: any; // Thông tin chi tiết địa điểm
  liked_by_friends: FriendLikedInfo[];
  friend_count: number;
}