import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { MoreVertical } from 'lucide-react-native';
import { DateUtils } from '../../utils/dateUtils';
import { PillBadge } from '../shared';
import { ForumPost } from '../../services/forumService/forum.type';

interface PostHeaderProps {
  author: { id?: string; fullName: string; avatar?: string };
  status: string;
  createdAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenAuthor?: (userId: string) => void;
}

const defaultAvatar = 'https://i.pinimg.com/736x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg';

export const PostHeader = ({ author, status, createdAt, onEdit, onDelete, onOpenAuthor }: PostHeaderProps) => (
  <View className="flex-row items-center p-4">
    <TouchableOpacity onPress={() => author.id && onOpenAuthor?.(author.id)} activeOpacity={0.7}>
      <Image
        source={{ uri: author.avatar || defaultAvatar }}
        className="w-10 h-10 rounded-full"
      />
    </TouchableOpacity>
    <View className="ml-3 flex-1">
      <TouchableOpacity onPress={() => author.id && onOpenAuthor?.(author.id)} activeOpacity={0.7}>
        <Text className="font-bold text-gray-800">{author.fullName}</Text>
      </TouchableOpacity>
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
    
    <Menu>
      <MenuTrigger>
        <View className="ml-2 p-1">
          <MoreVertical size={20} color="#6B7280" />
        </View>
      </MenuTrigger>
      <MenuOptions customStyles={{
        optionsContainer: { borderRadius: 8, padding: 8, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 }
      }}>
        <MenuOption onSelect={() => onEdit?.()} text="Chỉnh sửa" />
        <MenuOption
          onSelect={() => {
            Alert.alert(
              'Xác nhận xóa',
              'Bạn có chắc muốn xóa bài viết này?',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: onDelete }
              ]
            );
          }}
          text="Xóa"
          customStyles={{ optionText: { color: 'red' } }}
        />
      </MenuOptions>
    </Menu>
  </View>
);