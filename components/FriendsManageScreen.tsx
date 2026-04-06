import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AxiosError } from 'axios';
import { Button, AvatarCircle } from './shared';
import { FriendService } from '../services/friendService/friend.service';
import { FriendRequest, FriendStatus, FriendUser } from '../services/friendService/friend.type';
import { UsersService } from '../services/userService/user.service';
import { UserSearchResult } from '../services/userService/user.type';

type FriendsTab = 'friends' | 'requests' | 'find';

interface FriendsManageScreenProps {
  onBack: () => void;
  onOpenUserProfile: (userId: string) => void;
}

const TabButton = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Button
    onPress={onPress}
    className="flex-1 items-center py-2 rounded-xl"
    style={{ backgroundColor: active ? '#2B8EF0' : '#EEF2FF' }}
  >
    <Text style={{ color: active ? '#FFFFFF' : '#374151', fontWeight: '700', fontSize: 13 }}>{label}</Text>
  </Button>
);

const FriendRow = ({
  friend,
  onOpenUserProfile,
  onUnfriend,
}: {
  friend: FriendUser;
  onOpenUserProfile: (userId: string) => void;
  onUnfriend: (userId: string) => void;
}) => (
  <View
    className="flex-row items-center px-4 py-3 rounded-2xl mb-2"
    style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }}
  >
    <AvatarCircle uri={friend.avatar || undefined} name={friend.fullName} size={48} backgroundColor="#D1D5DB" />
    <View className="flex-1 ml-3">
      <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>{friend.fullName}</Text>
      <Text className="text-[12px] text-gray-500">{friend.email}</Text>
    </View>
    <View className="flex-row" style={{ gap: 8 }}>
      <Button
        onPress={() => onOpenUserProfile(friend._id)}
        className="px-3 py-2 rounded-xl"
        style={{ backgroundColor: '#EBF5FF' }}
      >
        <Text style={{ color: '#2B8EF0', fontWeight: '700', fontSize: 12 }}>Hồ sơ</Text>
      </Button>
      <Button
        onPress={() => onUnfriend(friend._id)}
        className="px-3 py-2 rounded-xl"
        style={{ backgroundColor: '#FEE2E2' }}
      >
        <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 12 }}>Hủy bạn</Text>
      </Button>
    </View>
  </View>
);

const RequestRow = ({
  request,
  onOpenUserProfile,
  onRespond,
  isBusy,
}: {
  request: FriendRequest;
  onOpenUserProfile: (userId: string) => void;
  onRespond: (friendshipId: string, status: FriendStatus.ACCEPTED | FriendStatus.REJECTED) => void;
  isBusy: boolean;
}) => {
  const senderId = request.sender?._id || request.requester_id;

  return (
    <View
      className="px-4 py-3 rounded-2xl mb-2"
      style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }}
    >
      <View className="flex-row items-center">
        <AvatarCircle
          uri={request.sender?.avatar || undefined}
          name={request.sender?.fullName || 'Người dùng'}
          size={48}
          backgroundColor="#D1D5DB"
        />
        <View className="flex-1 ml-3">
          <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
            {request.sender?.fullName || 'Người dùng'}
          </Text>
          <Text className="text-[12px] text-gray-500">Muốn kết bạn với bạn</Text>
        </View>
        <Button
          onPress={() => onOpenUserProfile(senderId)}
          className="px-3 py-2 rounded-xl"
          style={{ backgroundColor: '#EBF5FF' }}
        >
          <Text style={{ color: '#2B8EF0', fontWeight: '700', fontSize: 12 }}>Hồ sơ</Text>
        </Button>
      </View>

      <View className="flex-row mt-3" style={{ gap: 8 }}>
        <Button
          disabled={isBusy}
          onPress={() => onRespond(request.id, FriendStatus.ACCEPTED)}
          className="flex-1 items-center py-2 rounded-xl"
          style={{ backgroundColor: '#DCFCE7' }}
        >
          <Text style={{ color: '#16A34A', fontWeight: '700' }}>Chấp nhận</Text>
        </Button>
        <Button
          disabled={isBusy}
          onPress={() => onRespond(request.id, FriendStatus.REJECTED)}
          className="flex-1 items-center py-2 rounded-xl"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <Text style={{ color: '#DC2626', fontWeight: '700' }}>Từ chối</Text>
        </Button>
      </View>
    </View>
  );
};

const SearchRow = ({
  user,
  onOpenUserProfile,
  onSendRequest,
  disabled,
}: {
  user: UserSearchResult;
  onOpenUserProfile: (userId: string) => void;
  onSendRequest: (userId: string) => void;
  disabled: boolean;
}) => {
  const userId = user.id;

  return (
    <View
      className="flex-row items-center px-4 py-3 rounded-2xl mb-2"
      style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }}
    >
      <AvatarCircle uri={user.avatar || undefined} name={user.fullName} size={48} backgroundColor="#D1D5DB" />
      <View className="flex-1 ml-3">
        <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>{user.fullName}</Text>
        {user.bio ? <Text className="text-[12px] text-gray-500">{user.bio}</Text> : null}
      </View>
      <View style={{ gap: 8 }}>
        <Button
          onPress={() => onOpenUserProfile(userId)}
          className="px-3 py-2 rounded-xl"
          style={{ backgroundColor: '#EBF5FF' }}
        >
          <Text style={{ color: '#2B8EF0', fontWeight: '700', fontSize: 12 }}>Hồ sơ</Text>
        </Button>
        <Button
          disabled={disabled}
          onPress={() => onSendRequest(userId)}
          className="px-3 py-2 rounded-xl"
          style={{ backgroundColor: disabled ? '#D1D5DB' : '#D7FBE8' }}
        >
          <Text style={{ color: disabled ? '#6B7280' : '#15803D', fontWeight: '700', fontSize: 12 }}>
            {disabled ? 'Đã gửi' : 'Kết bạn'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export const FriendsManageScreen = ({ onBack, onOpenUserProfile }: FriendsManageScreenProps) => {
  const [activeTab, setActiveTab] = useState<FriendsTab>('friends');

  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const [respondingRequestId, setRespondingRequestId] = useState<string>('');

  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [requestedUserIds, setRequestedUserIds] = useState<Set<string>>(new Set());

  const loadFriendsData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsData, requestData] = await Promise.all([
        FriendService.getMyFriends(),
        FriendService.getPendingRequests(),
      ]);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setRequests(Array.isArray(requestData) ? requestData : []);
    } catch (error) {
      console.error('Failed to load friends data', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu bạn bè.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = keyword.trim();
      if (!trimmed) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await UsersService.searchUsers(trimmed);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Search users failed', error);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleUnfriend = (userId: string) => {
    Alert.alert('Hủy kết bạn', 'Bạn có chắc muốn hủy kết bạn?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy bạn',
        style: 'destructive',
        onPress: async () => {
          try {
            await FriendService.unfriend(userId);
            setFriends((prev) => prev.filter((item) => item._id !== userId));
          } catch {
            Alert.alert('Lỗi', 'Không thể hủy kết bạn lúc này.');
          }
        },
      },
    ]);
  };

  const handleRespond = async (friendshipId: string, status: FriendStatus.ACCEPTED | FriendStatus.REJECTED) => {
    try {
      setRespondingRequestId(friendshipId);
      await FriendService.respondRequest(friendshipId, { status });
      setRequests((prev) => prev.filter((item) => item.id !== friendshipId));

      if (status === FriendStatus.ACCEPTED) {
        await loadFriendsData();
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể xử lý lời mời kết bạn.');
    } finally {
      setRespondingRequestId('');
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      await FriendService.sendRequest({ target_user_id: targetUserId });
      setRequestedUserIds((prev) => new Set(prev).add(targetUserId));
      Alert.alert('Thành công', 'Đã gửi lời mời kết bạn.');
    } catch (error) {
      const err = error as AxiosError<{ message?: string | string[] }>;
      const message = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message.join(', ')
        : err.response?.data?.message;
      Alert.alert('Không thể gửi lời mời', message || 'Vui lòng thử lại sau.');
    }
  };

  const friendIdSet = useMemo(() => new Set(friends.map((item) => item._id)), [friends]);

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
            Bạn bè
          </Text>
          <View style={{ width: 34 }} />
        </View>

        <View className="flex-row mt-3" style={{ gap: 8 }}>
          <TabButton active={activeTab === 'friends'} label={`Bạn bè (${friends.length})`} onPress={() => setActiveTab('friends')} />
          <TabButton active={activeTab === 'requests'} label={`Lời mời (${requests.length})`} onPress={() => setActiveTab('requests')} />
          <TabButton active={activeTab === 'find'} label="Tìm bạn" onPress={() => setActiveTab('find')} />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2B8EF0" />
        </View>
      ) : null}

      {!loading && activeTab === 'friends' ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 }}
          renderItem={({ item }) => (
            <FriendRow
              friend={item}
              onOpenUserProfile={onOpenUserProfile}
              onUnfriend={handleUnfriend}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center pt-20">
              <Text className="text-gray-500">Bạn chưa có bạn bè nào.</Text>
            </View>
          }
        />
      ) : null}

      {!loading && activeTab === 'requests' ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 }}
          renderItem={({ item }) => (
            <RequestRow
              request={item}
              onOpenUserProfile={onOpenUserProfile}
              onRespond={handleRespond}
              isBusy={respondingRequestId === item.id}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center pt-20">
              <Text className="text-gray-500">Không có lời mời kết bạn nào.</Text>
            </View>
          }
        />
      ) : null}

      {!loading && activeTab === 'find' ? (
        <View className="flex-1 px-4 pt-3">
          <View
            className="flex-row items-center px-3 rounded-xl"
            style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', height: 44 }}
          >
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Nhập tên hoặc email để tìm..."
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, color: '#111827', fontSize: 14 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isSearching ? (
            <View className="items-center justify-center pt-12">
              <ActivityIndicator color="#2B8EF0" />
              <Text className="mt-2 text-gray-500">Đang tìm người dùng...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
              renderItem={({ item }) => (
                <SearchRow
                  user={item}
                  onOpenUserProfile={onOpenUserProfile}
                  onSendRequest={handleSendRequest}
                  disabled={friendIdSet.has(item.id) || requestedUserIds.has(item.id)}
                />
              )}
              ListEmptyComponent={
                <View className="items-center justify-center pt-16">
                  <Text className="text-gray-500">
                    {keyword.trim() ? 'Không tìm thấy người dùng.' : 'Hãy nhập từ khóa để bắt đầu tìm kiếm.'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
};
