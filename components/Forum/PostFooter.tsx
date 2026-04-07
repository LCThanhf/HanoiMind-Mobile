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
  placeNames: string[];
  journeyId?: string;
  viewsCount: number;
  onLikePress: () => void;
  disabledLike: boolean;
}

export const PostFooter = ({ 
  placeNames = [],
  journeyId ,
  likesCount, isLiked, likeLoading, commentsCount, viewsCount, onLikePress, disabledLike 
}: PostFooterProps) => (

<View className="p-4">
  {/* Tags Địa điểm - Render động từ mảng placeNames */}
  <View className="flex-row flex-wrap gap-2 mb-4">
    {placeNames && placeNames.length > 0 ? (
      placeNames.map((name, index) => (
        <View 
          key={index} 
          className="flex-row items-center bg-success-soft px-3 py-1.5 rounded-xl border border-success-soft"
        >
          <MapPin size={14} color={AppColors.map.pin} />
          <Text className="text-[11px] text-success-strong font-semibold ml-1">
            {name}
          </Text>
        </View>
      ))
    ) : (
      /* Nếu đang load hoặc không có địa điểm thì hiện cái này cho đỡ trống */
      <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
        <MapPin size={14} color={AppColors.text.secondary} />
        <Text className="text-[11px] text-gray-400 font-semibold ml-1">Đang cập nhật...</Text>
      </View>
    )}

    {/* Giữ lại cái tag Navigation nếu ông muốn hiện Journey/Hành trình */}
    {journeyId && (
      <View className="flex-row items-center bg-success-soft px-3 py-1.5 rounded-xl border border-success-soft">
        <Navigation size={14} color={AppColors.map.pin} />
        <Text className="text-[11px] text-success-strong font-semibold ml-1">Hành trình</Text>
      </View>
    )}
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