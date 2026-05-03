import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { AuthorMinified } from '../../../services/forumService/forum.type';

interface Props {
  replyingTo?: AuthorMinified | null;
  onCancelReply: () => void;
  onSubmit: (content: string) => void;
}

export const CommentInput: React.FC<Props> = ({ replyingTo, onCancelReply, onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <View className="absolute bottom-8 left-0 right-0 bg-white border-t border-gray-200 p-3">
      {replyingTo && (
        <View className="flex-row justify-between items-center mb-2 bg-gray-100 px-3 py-1 rounded-lg">
          <Text className="text-xs text-gray-600">Đang trả lời {replyingTo.fullName}</Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Text className="text-xs text-blue-500 font-bold">Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
          placeholder="Viết bình luận..."
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity onPress={handleSend} disabled={!content.trim()} className="ml-3">
          <Text className={`font-bold ${content.trim() ? 'text-blue-600' : 'text-gray-400'}`}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};