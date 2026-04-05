import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, MessageCircle, Eye, Heart, Navigation } from 'lucide-react-native';
import { StatItemView } from '../shared';
import { AppColors } from '../../utils/theme';

interface PostFooterProps {
  likesCount: number;
  isLiked: boolean;
  likeLoading: boolean;
  commentsCount: number;
  viewsCount: number;
  onLikePress: () => void;
  disabledLike: boolean;
}

export const PostFooter = ({ 
  likesCount, isLiked, likeLoading, commentsCount, viewsCount, onLikePress, disabledLike 
}: PostFooterProps) => (
  <View className="p-4">
    {/* Tags Địa điểm */}
    <View className="flex-row space-x-2 mb-4">
      <View className="flex-row items-center bg-primary-soft px-3 py-1.5 rounded-xl border border-primary-soft">
        <MapPin size={14} color="#3b82f6" />
        <Text className="text-[11px] text-primary-strong font-semibold ml-1">Phố cổ Hội An</Text>
      </View>
      <View className="flex-row items-center bg-success-soft px-3 py-1.5 rounded-xl border border-success-soft">
        <Navigation size={14} color={AppColors.status.success} />
        <Text className="text-[11px] text-success-strong font-semibold ml-1">H</Text>
      </View>
    </View>

    {/* Chỉ số tương tác */}
    <View className="flex-row justify-between items-center border-t border-gray-50 pt-3 px-2">
      <View className="flex-row gap-x-8">
        <TouchableOpacity onPress={onLikePress} disabled={disabledLike} className="flex-row items-center">
          <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#666'} />
          <Text className="text-xs text-gray-500 ml-1 font-medium">
            {likeLoading ? '...' : likesCount}
          </Text>
        </TouchableOpacity>
        <StatItemView icon={<MessageCircle size={18} color="#666" />} value={commentsCount} />
        <StatItemView icon={<Eye size={18} color="#666" />} value={viewsCount} />
      </View>
      <TouchableOpacity>
        <Text className="text-primary font-bold text-xs">Chi tiết</Text>
      </TouchableOpacity>
    </View>
  </View>
);