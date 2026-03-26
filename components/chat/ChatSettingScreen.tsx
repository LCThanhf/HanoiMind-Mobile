import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Switch, FlatList, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface ChatSettingsScreenProps {
  roomId: string;
  chatName: string;
  onBack: () => void;
  // Giả sử bạn có thể truyền thêm type hoặc danh sách tin nhắn để lấy ảnh
  isGroup?: boolean; 
  mediaFiles?: any[]; 
}

export const ChatSettingsScreen = ({ roomId, chatName, onBack, isGroup = false, mediaFiles = [] }: ChatSettingsScreenProps) => {
  const insets = useSafeAreaInsets();
  const [isMuted, setIsMuted] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random&size=200`;

  const SettingRow = ({ icon, title, color = '#111827', rightElement, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-5 py-4 bg-white active:bg-gray-50 border-b border-gray-50"
    >
      <View className="w-8">{icon}</View>
      <Text className="flex-1 text-base font-medium ml-2" style={{ color }}>{title}</Text>
      {rightElement}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">
      {title}
    </Text>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-2 pb-2 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={onBack} className="p-2">
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Chi tiết</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Profile Info */}
        <View className="items-center pt-8 pb-8 bg-white shadow-sm">
          <Image source={{ uri: avatarUrl }} className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
          <Text className="text-2xl font-bold text-gray-900">{chatName}</Text>
        </View>

        {/* File phương tiện (Hiển thị preview nếu có ảnh) */}
        <SectionTitle title="File phương tiện & File" />
        <View className="bg-white p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-semibold text-gray-700">Ảnh & Video đã gửi</Text>
            <TouchableOpacity><Text className="text-blue-500 text-xs">Xem tất cả</Text></TouchableOpacity>
          </View>
          
          {mediaFiles.length > 0 ? (
            <FlatList
              data={mediaFiles}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} className="w-20 h-20 rounded-lg mr-2 bg-gray-200" />
              )}
            />
          ) : (
            <View className="py-4 items-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Text className="text-gray-400 text-xs">Không có file phương tiện nào</Text>
            </View>
          )}
        </View>

        {/* Tùy chỉnh */}

        {/* Hành động */}
        <SectionTitle title="Quyền riêng tư & Hỗ trợ" />
        <View className="bg-white">
          <SettingRow 
            title="Tắt thông báo" 
            rightElement={<Switch value={isMuted} onValueChange={setIsMuted} trackColor={{ true: '#2B8EF0' }} />}
            icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" /></Svg>}
          />
          <SettingRow 
            title="Tìm kiếm cuộc trò chuyện" 
            icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Circle cx="11" cy="11" r="8"/><Path d="M21 21l-4.35-4.35"/></Svg>}
          />
          <SettingRow 
            title="Báo cáo lỗi" 
            color="#EF4444"
            icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Circle cx="12" cy="12" r="10"/><Path d="M12 8v4M12 16h.01"/></Svg>}
          />
          
          {/* 👉 CHỈ HIỆN RỜI NHÓM NẾU LÀ NHÓM CHAT */}
          {isGroup && (
            <SettingRow 
              title="Rời khỏi nhóm" 
              color="#EF4444"
              icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><Path d="M16 17l5-5-5-5M21 12H9"/></Svg>}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};