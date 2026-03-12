import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { BottomTabBar, MainTab } from './BottomTabBar';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
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

export const ProfileScreen = ({ onBack, onLogout, activeTab, onTabChange }: ProfileScreenProps) => {

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

        <View className="px-5 mt-16">
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.85}
            className="items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 16 }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabBar activeTab={activeTab} onTabPress={onTabChange} />
    </SafeAreaView>
  );
};