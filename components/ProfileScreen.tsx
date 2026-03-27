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

interface ProfileScreenProps {
  onLogout: () => void;
  onOpenProfile: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
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

export const ProfileScreen = ({ onLogout, onOpenProfile, activeTab, onTabChange }: ProfileScreenProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin người dùng khi vào màn hình
  useEffect(() => {
    fetchProfile();
  }, []);

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

        {/* Cụm chức năng */}
        <View className="px-4">
          <View className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            {profileItems.map((item, index) => (
              <ListActionRow
                key={item.key}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
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