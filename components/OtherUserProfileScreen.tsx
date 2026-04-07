import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AxiosError } from 'axios';
import ChatService from '../services/chatService/chat.service';
import { FriendService } from '../services/friendService/friend.service';
import { FriendRequest, FriendStatus, FriendUser } from '../services/friendService/friend.type';
import { UsersService } from '../services/userService/user.service';
import { PublicProfile, User } from '../services/userService/user.type';
import { AvatarCircle, Button } from './shared';

type RelationshipState = 'self' | 'friend' | 'request-received' | 'not-friend';

interface OtherUserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onMessage: (roomId: string, chatName: string) => void;
}

const getEntityId = (entity: unknown): string | null => {
  if (!entity || typeof entity !== 'object') {
    return null;
  }

  const candidate = entity as { _id?: unknown; id?: unknown };
  if (typeof candidate._id === 'string' && candidate._id.trim()) {
    return candidate._id;
  }

  if (typeof candidate.id === 'string' && candidate.id.trim()) {
    return candidate.id;
  }

  return null;
};

export const OtherUserProfileScreen = ({ userId, onBack, onMessage }: OtherUserProfileScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [sendingFriendRequest, setSendingFriendRequest] = useState(false);
  const [openingMessage, setOpeningMessage] = useState(false);

  const [myProfile, setMyProfile] = useState<User | null>(null);
  const [otherProfile, setOtherProfile] = useState<PublicProfile | null>(null);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const loadProfileData = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    try {
      const [me, other, friendsData, pendingData] = await Promise.all([
        UsersService.getMe(),
        UsersService.getPublicProfile(userId),
        FriendService.getMyFriends(),
        FriendService.getPendingRequests(),
      ]);
      setMyProfile(me);
      setOtherProfile(other);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setRequests(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error('Failed to load public profile', error);
      Alert.alert('Lỗi', 'Không thể tải hồ sơ người dùng.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const relationship = useMemo<RelationshipState>(() => {
    if (!myProfile || !otherProfile) {
      return 'not-friend';
    }

    const myId = getEntityId(myProfile);
    const otherId = getEntityId(otherProfile);
    if (!otherId) {
      return 'not-friend';
    }

    if (myId && myId === otherId) {
      return 'self';
    }

    if (friends.some((item) => getEntityId(item) === otherId)) {
      return 'friend';
    }

    const hasIncomingPending = requests.some(
      (item) =>
        item.status === FriendStatus.PENDING &&
        (getEntityId(item.sender) === otherId || item.requester_id === otherId)
    );

    if (hasIncomingPending) {
      return 'request-received';
    }

    return 'not-friend';
  }, [friends, myProfile, otherProfile, requests]);

  const handleSendFriendRequest = async () => {
    const targetUserId = getEntityId(otherProfile);
    if (!targetUserId) {
      Alert.alert('Lỗi', 'Không xác định được người dùng để gửi lời mời kết bạn.');
      return;
    }

    try {
      setSendingFriendRequest(true);
      await FriendService.sendRequest({ target_user_id: targetUserId });
      Alert.alert('Thành công', 'Đã gửi lời mời kết bạn.');
    } catch (error) {
      const err = error as AxiosError<{ message?: string | string[] }>;
      const message = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message.join(', ')
        : err.response?.data?.message;
      Alert.alert('Không thể gửi lời mời', message || 'Vui lòng thử lại sau.');
    } finally {
      setSendingFriendRequest(false);
    }
  };

  const handleMessageUser = async () => {
    if (!otherProfile) {
      return;
    }

    try {
      setOpeningMessage(true);
      const targetUserId = getEntityId(otherProfile);
      if (!targetUserId) {
        Alert.alert('Lỗi', 'Không xác định được người dùng để mở chat.');
        return;
      }

      const room = await ChatService.createDirectChat(targetUserId);
      if (room && room._id) {
        onMessage(room._id, otherProfile.fullName);
      } else {
        Alert.alert('Lỗi', 'Không thể mở cuộc trò chuyện.');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể mở cuộc trò chuyện.');
    } finally {
      setOpeningMessage(false);
    }
  };

  const relationshipLabel = () => {
    if (relationship === 'self') return 'Đây là hồ sơ của bạn';
    if (relationship === 'friend') return 'Hai bạn đã là bạn bè';
    if (relationship === 'request-received') return 'Người này đã gửi lời mời kết bạn cho bạn';
    return 'Bạn chưa kết bạn với người này';
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#2B8EF0" />
      </SafeAreaView>
    );
  }

  if (!otherProfile) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC] items-center justify-center px-6">
        <Text className="text-gray-600 text-center">Không tìm thấy hồ sơ người dùng.</Text>
        <Button
          onPress={onBack}
          className="mt-4 px-4 py-2 rounded-xl"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <Text className="text-gray-700 font-semibold">Quay lại</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC]">
      <View className="px-4 pt-2 pb-3 border-b border-[#E5E7EB] bg-[#F8FAFC]">
        <View className="flex-row items-center">
          <Button
            onPress={onBack}
            activeOpacity={0.8}
            style={{ width: 34, height: 34, justifyContent: 'center', alignItems: 'center' }}
          >
            <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Button>
          <Text className="flex-1 text-center text-[22px] text-gray-900" style={{ fontWeight: '700' }}>
            Hồ sơ của {otherProfile.fullName}
          </Text>
          <View style={{ width: 34 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}>
        <View
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }}
        >
          <View className="items-center">
            <AvatarCircle
              uri={otherProfile.avatar || undefined}
              name={otherProfile.fullName}
              size={98}
              backgroundColor="#D1D5DB"
            />
            <Text className="mt-4 text-[24px] text-gray-900" style={{ fontWeight: '800' }}>{otherProfile.fullName}</Text>
            <Text className="mt-1 text-[13px] text-gray-500">Vai trò: {otherProfile.role}</Text>
          </View>

          <View className="mt-4">
            <Text className="text-[14px] text-gray-900" style={{ fontWeight: '700' }}>Giới thiệu</Text>
            <Text className="mt-1 text-[14px] text-gray-600">
              {otherProfile.bio?.trim() ? otherProfile.bio : 'Người dùng chưa cập nhật giới thiệu.'}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-[14px] text-gray-900" style={{ fontWeight: '700' }}>Travel Style</Text>
            <Text className="mt-1 text-[14px] text-gray-600">
              {otherProfile.travelStyle?.trim() ? otherProfile.travelStyle : 'Chưa có thông tin.'}
            </Text>
          </View>

          <View className="mt-5 px-3 py-3 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
            <Text className="text-[13px] text-gray-700">{relationshipLabel()}</Text>
          </View>

          <View className="mt-5" style={{ gap: 10 }}>
            {relationship === 'not-friend' ? (
              <Button
                onPress={handleSendFriendRequest}
                loading={sendingFriendRequest}
                className="items-center py-3 rounded-xl"
                style={{ backgroundColor: '#D7FBE8' }}
              >
                <Text style={{ color: '#15803D', fontWeight: '700' }}>Gửi lời mời kết bạn</Text>
              </Button>
            ) : null}

            {relationship === 'self' ? null : (
              <Button
                onPress={handleMessageUser}
                loading={openingMessage}
                className="items-center py-3 rounded-xl"
                style={{ backgroundColor: '#EBF5FF' }}
              >
                <Text style={{ color: '#2B8EF0', fontWeight: '700' }}>Nhắn tin</Text>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
