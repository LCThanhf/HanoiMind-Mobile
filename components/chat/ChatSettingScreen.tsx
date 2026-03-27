import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Switch, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { AvatarCircle, ListActionRow, ScreenHeader, SectionLabel } from '../shared';

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

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Chi tiết"
        onBack={onBack}
        backIconType="chevron"
        horizontalPadding={8}
        topPadding={insets.top + 2}
        bottomPadding={8}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Profile Info */}
        <View className="items-center pt-8 pb-8 bg-white shadow-sm">
          <View className="mb-4 rounded-full overflow-hidden" style={{ width: 96, height: 96 }}>
            <AvatarCircle name={chatName} size={96} backgroundColor="#D1D5DB" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{chatName}</Text>
        </View>

        {/* File phương tiện (Hiển thị preview nếu có ảnh) */}
        <SectionLabel title="File phương tiện & File" />
        <View className="bg-white p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-semibold text-gray-700">Ảnh & Video đã gửi</Text>
            <TouchableOpacity><Text className="text-primary text-xs">Xem tất cả</Text></TouchableOpacity>
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
        <SectionLabel title="Quyền riêng tư & Hỗ trợ" />
        <View className="bg-white">
          <ListActionRow
            title="Tắt thông báo"
            rightElement={<Switch value={isMuted} onValueChange={setIsMuted} trackColor={{ true: '#2B8EF0' }} />}
            icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" /></Svg>}
            iconContainerSize={32}
            horizontalPadding={20}
            verticalPadding={16}
          />
          <ListActionRow
            title="Tìm kiếm cuộc trò chuyện"
            icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Circle cx="11" cy="11" r="8" /><Path d="M21 21l-4.35-4.35" /></Svg>}
            iconContainerSize={32}
            horizontalPadding={20}
            verticalPadding={16}
          />
          <ListActionRow
            title="Báo cáo lỗi"
            titleColor="#EF4444"
            icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Circle cx="12" cy="12" r="10" /><Path d="M12 8v4M12 16h.01" /></Svg>}
            iconContainerSize={32}
            horizontalPadding={20}
            verticalPadding={16}
          />

          {/* 👉 CHỈ HIỆN RỜI NHÓM NẾU LÀ NHÓM CHAT */}
          {isGroup && (
            <ListActionRow
              title="Rời khỏi nhóm"
              titleColor="#EF4444"
              icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><Path d="M16 17l5-5-5-5M21 12H9" /></Svg>}
              iconContainerSize={32}
              horizontalPadding={20}
              verticalPadding={16}
              showBorderBottom={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};
