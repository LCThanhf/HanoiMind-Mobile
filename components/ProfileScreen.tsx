import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
}

const profileItems = [
  {
    key: 'trips',
    title: 'My Trip',
    subtitle: 'View and manage your travel plans',
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
    title: 'Notifications',
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

export const ProfileScreen = ({ onBack, onLogout, onNavigateHome }: ProfileScreenProps) => {
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'trips' | 'explore' | 'profile'>('profile');

  const handleHomePress = () => {
    setActiveNavTab('home');
    onNavigateHome?.();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F4F7]">
      <View className="px-5 pt-12 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="w-10">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <Text className="text-[18px] text-gray-900" style={{ fontWeight: '700' }}>
            Profile
          </Text>

          <View className="w-10" />
        </View>
      </View>

      <View className="h-px bg-[#E5E7EB]" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="items-center px-5 pt-5 pb-6">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
          />
          <Text className="mt-5 text-[28px] text-gray-900" style={{ fontWeight: '700' }}>
            Minh Anh
          </Text>
          <Text className="mt-1 text-[16px] text-gray-500">minhanh@gmail.com</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            className="mt-4 px-8 py-3 rounded-xl"
            style={{ backgroundColor: '#D7E9F7' }}
          >
            <Text className="text-[15px]" style={{ color: '#2B8EF0', fontWeight: '700' }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-4">
          <View className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            {profileItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                className="flex-row items-center px-4 py-4"
                style={{
                  borderBottomWidth: index === profileItems.length - 1 ? 0 : 1,
                  borderBottomColor: '#E5E7EB',
                }}
              >
                <View
                  className="mr-4 items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, backgroundColor: item.accent }}
                >
                  {item.icon}
                </View>

                <View className="flex-1">
                  <Text className="text-[24px] text-gray-900" style={{ fontWeight: '500', fontSize: 16 }}>
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text className="mt-1 text-[13px] text-gray-500">{item.subtitle}</Text>
                  ) : null}
                </View>

                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 18l6-6-6-6"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-7 mt-16">
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.85}
            className="items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: '#F0C9D3' }}
          >
            <Text className="text-[17px]" style={{ color: '#FF3B30', fontWeight: '500' }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-white flex-row items-center justify-around"
        style={{
          height: 70,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity className="flex-1 items-center justify-center" activeOpacity={0.7} onPress={handleHomePress}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="4" stroke={activeNavTab === 'home' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" />
            <Path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke={activeNavTab === 'home' ? '#2B8EF0' : '#9CA3AF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text
            className="mt-1 text-[11px]"
            style={{
              fontWeight: activeNavTab === 'home' ? '600' : '500',
              color: activeNavTab === 'home' ? '#2B8EF0' : '#6B7280',
            }}
          >
            Trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center justify-center" activeOpacity={0.7} onPress={() => setActiveNavTab('trips')}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
              stroke={activeNavTab === 'trips' ? '#2B8EF0' : '#9CA3AF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="10" r="3" stroke={activeNavTab === 'trips' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" />
          </Svg>
          <Text
            className="mt-1 text-[11px]"
            style={{
              fontWeight: activeNavTab === 'trips' ? '600' : '500',
              color: activeNavTab === 'trips' ? '#2B8EF0' : '#6B7280',
            }}
          >
            Chuyến đi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center justify-center" activeOpacity={0.7} onPress={() => setActiveNavTab('explore')}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke={activeNavTab === 'explore' ? '#2B8EF0' : '#9CA3AF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text
            className="mt-1 text-[11px]"
            style={{
              fontWeight: activeNavTab === 'explore' ? '600' : '500',
              color: activeNavTab === 'explore' ? '#2B8EF0' : '#6B7280',
            }}
          >
            Khám phá
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center justify-center" activeOpacity={0.7} onPress={() => setActiveNavTab('profile')}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={activeNavTab === 'profile' ? '#2B8EF0' : '#9CA3AF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="7" r="4" stroke={activeNavTab === 'profile' ? '#2B8EF0' : '#9CA3AF'} strokeWidth="2" />
          </Svg>
          <Text
            className="mt-1 text-[11px]"
            style={{
              fontWeight: activeNavTab === 'profile' ? '600' : '500',
              color: activeNavTab === 'profile' ? '#2B8EF0' : '#6B7280',
            }}
          >
            Cá nhân
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};