import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
// 1. IMPORT THÊM HOOK NÀY
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type MainTab = 'home' | 'trips' | 'explore' | 'chat' | 'profile';

interface BottomTabBarProps {
  activeTab: MainTab;
  onTabPress: (tab: MainTab) => void;
}

export const BottomTabBar = ({ activeTab, onTabPress }: BottomTabBarProps) => {
  // 2. LẤY THÔNG SỐ SAFE AREA
  const insets = useSafeAreaInsets();

  // Tính toán padding bottom an toàn: 
  // Nếu máy có viền dưới (iPhone/Android vuốt) thì lấy insets.bottom, 
  // nếu máy đời cũ có nút bấm thì mặc định là 10.
  const safePaddingBottom = Math.max(insets.bottom, 10);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white flex-row items-center justify-around"
      style={{
        // 3. ĐỂ HEIGHT TỰ ĐỘNG CO GIÃN THEO SAFE AREA
        height: 60 + safePaddingBottom,
        paddingBottom: safePaddingBottom,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
      }}
    >
      {/* Home */}
      <TouchableOpacity className="flex-1 items-center justify-center h-full" activeOpacity={0.7} onPress={() => onTabPress('home')}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="4" stroke={activeTab === 'home' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" />
          <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={activeTab === 'home' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text className="text-[11px] mt-1" style={{ fontWeight: activeTab === 'home' ? '600' : '500', color: activeTab === 'home' ? '#2B8EF0' : '#6B7280' }}>
          Trang chủ
        </Text>
      </TouchableOpacity>

      {/* Các tab khác giữ nguyên, chỉ cần thêm className="... h-full" cho TouchableOpacity nếu muốn vùng bấm rộng hơn */}

      {/* Trips */}
      <TouchableOpacity className="flex-1 items-center justify-center h-full" activeOpacity={0.7} onPress={() => onTabPress('trips')}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={activeTab === 'trips' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="12" cy="10" r="3" stroke={activeTab === 'trips' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" />
        </Svg>
        <Text className="text-[11px] mt-1" style={{ fontWeight: activeTab === 'trips' ? '600' : '500', color: activeTab === 'trips' ? '#2B8EF0' : '#6B7280' }}>
          Chuyến đi
        </Text>
      </TouchableOpacity>

      {/* Explore */}
      <TouchableOpacity className="flex-1 items-center justify-center h-full" activeOpacity={0.7} onPress={() => onTabPress('explore')}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={activeTab === 'explore' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text className="text-[11px] mt-1" style={{ fontWeight: activeTab === 'explore' ? '600' : '500', color: activeTab === 'explore' ? '#2B8EF0' : '#6B7280' }}>
          Khám phá
        </Text>
      </TouchableOpacity>

      {/* Chat */}
      <TouchableOpacity className="flex-1 items-center justify-center h-full" activeOpacity={0.7} onPress={() => onTabPress('chat')}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={activeTab === 'chat' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text className="text-[11px] mt-1" style={{ fontWeight: activeTab === 'chat' ? '600' : '500', color: activeTab === 'chat' ? '#2B8EF0' : '#6B7280' }}>
          Tin nhắn
        </Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity className="flex-1 items-center justify-center h-full" activeOpacity={0.7} onPress={() => onTabPress('profile')}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={activeTab === 'profile' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="12" cy="7" r="4" stroke={activeTab === 'profile' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" />
        </Svg>
        <Text className="text-[11px] mt-1" style={{ fontWeight: activeTab === 'profile' ? '600' : '500', color: activeTab === 'profile' ? '#2B8EF0' : '#6B7280' }}>
          Cá nhân
        </Text>
      </TouchableOpacity>
    </View>
  );
};