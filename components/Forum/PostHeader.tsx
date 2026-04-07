import React from 'react';
import { View, Text, Image } from 'react-native';
import { DateUtils } from '../../utils/dateUtils';
import { PillBadge } from '../shared';
import { ForumPost } from '../../services/forumService/forum.type';

interface PostHeaderProps {
  author: { fullName: string; avatar?: string };
  status: string;
  createdAt: string;
}

const defaultAvatar = 'https://i.pinimg.com/736x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg';

export const PostHeader = ({ author, status, createdAt }: PostHeaderProps) => (
  <View className="flex-row items-center p-4">
    <Image
      source={{ uri: author.avatar || defaultAvatar }}
      className="w-10 h-10 rounded-full"
    />
    <View className="ml-3 flex-1">
      <Text className="font-bold text-gray-800">{author.fullName}</Text>
      <Text className="text-xs text-gray-400">{DateUtils.formatDateTime(createdAt)}</Text>
    </View>
    
    <PillBadge 
      label={status === "PUBLISHED" ? "Công Khai" : status === "DRAFT" ? "Nháp" : status === "HIDDEN" ? "Chỉ mình tôi" : "Không xác định"}
      backgroundColor="#DCFCE7"
      textColor="#15803D"
      textSize={10}
      textWeight="700"
      containerStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
    />
  </View>
);