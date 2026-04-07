import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { MainTab } from './BottomTabBar';
import { Button, AvatarCircle, ListActionRow } from './shared';

// Import Service và Type
import { UsersService } from '../services/userService/user.service';
import { User } from '../services/userService/user.type';
import { JourneyService } from '../services/journeyService/journey.service';
import { FavoriteService } from '../services/favoriteService/favorite.service';
import { FavoriteType } from '../services/favoriteService/favorite.type';
import { FriendService } from '../services/friendService/friend.service';

interface TravelStats {
  completedTrips: number;
  placesVisited: number;
  friends: number;
  favorites: number;
}

interface ProfileScreenProps {
  onLogout: () => void;
  onOpenProfile: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onNavigate?: (key: string) => void;
}

const profileItems = [
  {
    key: 'trips',
    title: 'Hành trình của tôi',
    subtitle: 'Xem và quản lý các kế hoạch du lịch',
    accent: '#DCEEFF',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="5" width="18" height="16" rx="3" stroke="#2B8EF0" strokeWidth="2" />
        <Path d="M8 3v4M16 3v4M3 10h18" stroke="#2B8EF0" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: 'messages',
    title: 'Tin nhắn',
    subtitle: 'Hãy trò chuyện cùng nhóm bạn đồng hành',
    accent: '#DCFCE7',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M7 10h2M11 10h2M15 10h2" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: 'friends',
    title: 'Bạn bè',
    subtitle: 'Quản lý bạn bè và lời mời kết bạn',
    accent: '#E0E7FF',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="#4F46E5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6"
          stroke="#4F46E5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'notifications',
    title: 'Thông báo',
    subtitle: '',
    accent: '#FFF1D8',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 17H9m9-5a6 6 0 1 0-12 0c0 3-1.5 4.5-1.5 4.5h15S18 15 18 12zm-4 8a2 2 0 0 1-4 0"
          stroke="#E6A133"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
];

export const ProfileScreen = ({ onLogout, onOpenProfile, activeTab, onTabChange, onNavigate }: ProfileScreenProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TravelStats | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [journeysResult, favoritesResult, friendsResult] = await Promise.allSettled([
      JourneyService.findMy(),
      FavoriteService.getMyFavorites(FavoriteType.PLACE),
      FriendService.getMyFriends(),
    ]);

    const rawJourneys = journeysResult.status === 'fulfilled' ? journeysResult.value : [];
    const journeys: any[] = Array.isArray(rawJourneys)
      ? rawJourneys
      : (rawJourneys as any)?.data ?? [];

    const favorites = favoritesResult.status === 'fulfilled' ? favoritesResult.value : [];
    const friends = friendsResult.status === 'fulfilled' ? friendsResult.value : [];

    const now = new Date();
    const completedJourneys = journeys.filter((j: any) => j.end_date && new Date(j.end_date) < now);

    const completedTrips = completedJourneys.length;
    const placesVisited = completedJourneys.reduce((total: number, j: any) =>
      total + (j.days ?? []).reduce((d: number, day: any) =>
        d + (day.stops ?? []).length, 0), 0);

    setStats({
      completedTrips,
      placesVisited,
      friends: friends.length,
      favorites: favorites.length,
    });
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Gọi service lấy profile (đã qua bóc tách response.data.data)
      const userData = await UsersService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Lỗi lấy profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn thoát ứng dụng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: onLogout // Gọi hàm đăng xuất từ props
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2B8EF0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F4F4F7]">

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 18 }} />

        <View className="items-center px-5 pt-5 pb-6">
          <View style={{ width: 96, height: 96, borderRadius: 48, overflow: 'hidden' }}>
            <AvatarCircle
              uri={user?.avatar}
              name={user?.fullName || 'User'}
              size={96}
              backgroundColor="#D1D5DB"
            />
          </View>
          <Text className="mt-5 text-[28px] text-gray-900 font-bold">
            {user?.fullName || 'Người dùng Bero'}
          </Text>
          <Text className="mt-1 text-[16px] text-gray-500">{user?.email}</Text>

          <Button
            activeOpacity={0.8}
            className="mt-4 px-8 py-3 rounded-xl"
            style={{ backgroundColor: '#D7E9F7' }}
          >
            <Text className="text-[15px] font-bold" style={{ color: '#2B8EF0' }}>
              Chỉnh sửa hồ sơ
            </Text>
          </Button>
        </View>

        {/* Travel Stats */}
        <View className="px-4 mb-4">
          <View className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
            <View className="flex-row">
              {/* Chuyến hoàn thành */}
              <View className="flex-1 items-center py-4" style={{ borderRightWidth: 1, borderRightColor: '#E5E7EB' }}>
                <Text className="text-[22px] font-bold text-[#111827]">
                  {stats?.completedTrips ?? '—'}
                </Text>
                <Text className="text-[12px] text-[#6B7280] mt-1 text-center px-1">Chuyến hoàn thành</Text>
              </View>
              {/* Địa điểm đã ghé */}
              <View className="flex-1 items-center py-4">
                <Text className="text-[22px] font-bold text-[#111827]">
                  {stats?.placesVisited ?? '—'}
                </Text>
                <Text className="text-[12px] text-[#6B7280] mt-1 text-center px-1">Địa điểm đã ghé</Text>
              </View>
            </View>
            <View className="flex-row" style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
              {/* Bạn bè */}
              <View className="flex-1 items-center py-4" style={{ borderRightWidth: 1, borderRightColor: '#E5E7EB' }}>
                <Text className="text-[22px] font-bold text-[#111827]">
                  {stats?.friends ?? '—'}
                </Text>
                <Text className="text-[12px] text-[#6B7280] mt-1 text-center px-1">Bạn đồng hành</Text>
              </View>
              {/* Yêu thích */}
              <View className="flex-1 items-center py-4">
                <Text className="text-[22px] font-bold text-[#111827]">
                  {stats?.favorites ?? '—'}
                </Text>
                <Text className="text-[12px] text-[#6B7280] mt-1 text-center px-1">Địa điểm yêu thích</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cụm chức năng */}
        <View className="px-4">
          <View className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            {profileItems.map((item, index) => (
              <ListActionRow
                key={item.key}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={() => onNavigate?.(item.key)}
                iconContainerBackgroundColor={item.accent}
                iconContainerSize={44}
                horizontalPadding={16}
                verticalPadding={16}
                showBorderBottom={index !== profileItems.length - 1}
                borderBottomColor="#E5E7EB"
                showChevron
              />
            ))}
          </View>
        </View>

        {/* Nút Đăng xuất */}
        <View className="px-5 mt-16">
          <Button
            onPress={handleLogoutPress}
            activeOpacity={0.85}
            className="items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Text className="text-[#EF4444] font-bold text-[16px]">
              Đăng xuất
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};