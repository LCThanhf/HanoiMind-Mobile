import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { ImagePlus, Hash, ShieldCheck } from 'lucide-react-native';

interface PostAdditionalOptionsProps {
  onMediaPress: () => void;
  onCategoryPress: () => void;
  onPrivacyPress: () => void;
  hasImages?: boolean;
  hasCategory?: boolean;
}

export const PostAdditionalOptions = ({
  onMediaPress,
  onCategoryPress,
  onPrivacyPress,
  hasImages = false,
  hasCategory = false,
}: PostAdditionalOptionsProps) => {
  return (
    <View className="rounded-3xl border border-gray-200 bg-gray-50 p-4 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-semibold text-gray-900">Tùy chọn bổ sung</Text>
        <Text className="text-xs text-gray-400">Chạm để chỉnh</Text>
      </View>

      <View className="flex-row justify-between gap-3">
        <TouchableOpacity
          onPress={onMediaPress}
          className="flex-1 rounded-3xl border border-gray-200 bg-white px-3 py-3 items-center justify-center"
        >
          <ImagePlus size={20} color="#2563EB" />
          <Text className="mt-2 text-[11px] font-semibold text-gray-600">Media</Text>
          {hasImages && <View className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCategoryPress}
          className="flex-1 rounded-3xl border border-gray-200 bg-white px-3 py-3 items-center justify-center"
        >
          <Hash size={20} color="#2563EB" />
          <Text className="mt-2 text-[11px] font-semibold text-gray-600">Danh mục</Text>
          {hasCategory && <View className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPrivacyPress}
          className="flex-1 rounded-3xl border border-gray-200 bg-white px-3 py-3 items-center justify-center"
        >
          <ShieldCheck size={20} color="#2563EB" />
          <Text className="mt-2 text-[11px] font-semibold text-gray-600">Quyền riêng tư</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
