import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, Globe, Users, Lock } from 'lucide-react-native';
import { Button, ScreenHeader, SelectableCard } from '../shared';

export const CreatePostScreen = () => {
  const [privacyMode, setPrivacyMode] = useState<'public' | 'friends' | 'private'>('public');

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Tạo bài viết" showBorder={false} horizontalPadding={16} topPadding={12} bottomPadding={8} />

      <ScrollView className="flex-1 p-4">
        <Text className="text-gray-400 mb-2">Nội dung câu chuyện</Text>
        <TextInput
          multiline
          placeholder="Chia sẻ trải nghiệm thú vị của bạn về chuyến đi..."
          className="text-lg text-gray-800 min-h-[150px] textAlignVertical-top"
        />

        <View className="mt-6">
          <Text className="font-bold mb-3"># Hashtags</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity className="bg-primary-soft px-4 py-2 rounded-full mr-2 flex-row items-center border border-primary-border">
              <Text className="text-primary-strong mr-1">#Hanoi</Text>
              <Text className="text-primary-strong">×</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full flex-row items-center">
              <Plus size={16} color="#666" />
              <Text className="ml-1 text-gray-600">Thêm</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="mt-8">
          <Text className="font-bold mb-4">Ai có thể xem bài viết?</Text>
          <View className="flex-row justify-between gap-2">
            <View className="flex-1">
              <SelectableCard
                title="Công khai"
                icon={<Globe size={20} color={privacyMode === 'public' ? '#3B82F6' : '#6B7280'} />}
                selected={privacyMode === 'public'}
                onPress={() => setPrivacyMode('public')}
                containerStyle={{ paddingVertical: 12, paddingHorizontal: 10 }}
              />
            </View>
            <View className="flex-1">
              <SelectableCard
                title="Bạn bè"
                icon={<Users size={20} color={privacyMode === 'friends' ? '#3B82F6' : '#6B7280'} />}
                selected={privacyMode === 'friends'}
                onPress={() => setPrivacyMode('friends')}
                containerStyle={{ paddingVertical: 12, paddingHorizontal: 10 }}
              />
            </View>
            <View className="flex-1">
              <SelectableCard
                title="Riêng tư"
                icon={<Lock size={20} color={privacyMode === 'private' ? '#3B82F6' : '#6B7280'} />}
                selected={privacyMode === 'private'}
                onPress={() => setPrivacyMode('private')}
                containerStyle={{ paddingVertical: 12, paddingHorizontal: 10 }}
              />
            </View>
          </View>
        </View>

        <View className="mt-10 mb-8">
          <Button label="Đăng bài viết" onPress={() => {}} style={{ borderRadius: 12, minHeight: 56 }} />
        </View>
      </ScrollView>
    </View>
  );
};

