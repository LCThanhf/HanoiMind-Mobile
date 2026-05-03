import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onReply: () => void;
  onDelete?: () => void; // Tùy chọn nếu là chủ sở hữu
  isOwner: boolean;
}

export const CommentActions: React.FC<Props> = ({ 
  isLiked, 
  likeCount, 
  onLike, 
  onReply, 
  onDelete,
  isOwner 
}) => {
  return (
    <View className="flex-row items-center mt-2 ml-12">
      <TouchableOpacity onPress={onLike} className="mr-4">
        <Text className={`text-xs font-bold ${isLiked ? 'text-blue-600' : 'text-gray-500'}`}>
          {isLiked ? 'Đã thích' : 'Thích'} {likeCount > 0 ? `(${likeCount})` : ''}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onReply} className="mr-4">
        <Text className="text-xs font-bold text-gray-500">Trả lời</Text>
      </TouchableOpacity>

      {isOwner && (
        <TouchableOpacity onPress={onDelete}>
          <Text className="text-xs font-bold text-red-400">Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};