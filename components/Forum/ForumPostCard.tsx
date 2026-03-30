import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MapPin, MessageCircle, Eye, Heart, Navigation, MoreVertical } from 'lucide-react-native';
import { ForumPost } from '../../services/forumService/forum.type';
import { ForumService } from '../../services/forumService/forum.service';
import { Button, PillBadge, StatItemView } from '../shared';
import { AppColors } from 'utils/theme';
import { DateUtils } from 'utils/dateUtils';

interface ForumPostCardProps {
  post?: ForumPost;
  postId?: string;
}

export const ForumPostCard = ({ post: initialPost, postId }: ForumPostCardProps) => {
  const [post, setPost] = useState<ForumPost | null>(initialPost || null);
  const [loading, setLoading] = useState<boolean>(!initialPost && !!postId);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        setError('Không có post ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const fetched = await ForumService.getPostDetail(postId);
        setPost(fetched as ForumPost);
      } catch (err) {
        console.error('Error fetching post detail:', err);
        setError('Không tải được bài viết');
      } finally {
        setLoading(false);
      }
    };

    // Nếu chưa có dữ liệu chi tiết, fetch từ API
    if (!initialPost && postId) {
      loadPost();
    }
  }, [initialPost, postId]);

  if (loading) {
    return (
      <View className="m-4 p-6 bg-white rounded-3xl border border-gray-100 items-center">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="mt-2 text-gray-500">Đang tải bài viết...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="m-4 p-6 bg-white rounded-3xl border border-red-100 items-center">
        <Text className="text-red-500 mb-2">{error}</Text>
        <Button
          className="px-4 py-2 bg-primary rounded-full"
          onPress={() => {
            setError('');
            setLoading(true);
            if (postId) {
              ForumService.getPostDetail(postId)
                .then((fetched) => setPost(fetched as ForumPost))
                .catch((err2) => {
                  console.error('Retry error:', err2);
                  setError('Không tải được bài viết');
                })
                .finally(() => setLoading(false));
            }
          }}
        >
          <Text className="text-white">Tải lại</Text>
        </Button>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="m-4 p-6 bg-white rounded-3xl border border-gray-100 items-center">
        <Text className="text-gray-500">Bài viết không tồn tại hoặc đã bị xóa.</Text>
      </View>
    );
  }

  const author = post.author || { id: '', fullName: 'Người dùng', avatar: '' };
  const imageUri = Array.isArray(post.images) && post.images.length > 0
    ? post.images[0]
    : 'https://www.svgrepo.com/show/432141/no-image.svg';
  const stats = post.stats || { likes: 0, comments: 0, views: 0 };
  const tags = Array.isArray(post.tag) ? post.tag : [];

  return (
    <View className="bg-white m-4 rounded-[32px] shadow-sm overflow-hidden border border-gray-100">
      {/* Header: Author info & Badge */}
      <View className="flex-row items-center p-4">
        <Image
          source={{ uri: author.avatar || 'https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg' }}
          className="w-10 h-10 rounded-full"
        />
        <View className="ml-3 flex-1">
          <Text className="font-bold text-gray-800">{author.fullName}</Text>
          <Text className="text-xs text-gray-400">{DateUtils.formatDateTime(post.created_at || new Date().toISOString())}</Text>
        </View>
        
      {/* Badge trạng thái - Dùng prop thay vì className */}
      <PillBadge 
        label={post.status === 'PUBLISHED' ? "Công khai" : "Bạn bè"} 
        backgroundColor="#DCFCE7" // Đây là màu success-soft
        textColor="#15803D"       // Đây là màu success-strong
        textSize={10}
        textWeight="700"
        // Nếu vẫn muốn tùy chỉnh thêm vị trí, dùng containerStyle của team:
        containerStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
      />
        <TouchableOpacity className="ml-2">
          <MoreVertical size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Body: Image with Overlay Tags & Title */}
      <View className="px-4">
        <ImageBackground
          source={{ uri: imageUri }}
          className="w-full h-56 rounded-[24px] overflow-hidden justify-end"
          imageStyle={{ borderRadius: 24 }}
        >
          {/* Overlay Gradient/Shadow để text dễ đọc */}
          <View className="bg-black/30 p-4">
            {/* Hashtags nằm đè lên ảnh */}
            <View className="flex-row space-x-2 mb-2">
              {tags.map((t, index) => (
                <View key={index} className="bg-white/20 px-2 py-0.5 rounded-md border border-white/30">
                  <Text className="text-white text-[10px] font-medium">#{t}</Text>
                </View>
              ))}
            </View>
            <Text className="text-white font-bold text-lg" numberOfLines={2}>
              {post.title}
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Content & Location/Journey Pills */}
      <View className="p-4">
        <Text className="text-gray-600 text-sm mb-4 leading-5" numberOfLines={2}>
          {post.content}
        </Text>

        <View className="flex-row space-x-2 mb-4">
          <View className="flex-row items-center bg-primary-soft px-3 py-1.5 rounded-xl border border-primary-soft">
            <MapPin size={14} color="#3b82f6" />
            <Text className="text-[11px] text-primary-strong font-semibold ml-1">Phố cổ Hội An</Text>
          </View>
          <View className="flex-row items-center bg-success-soft px-3 py-1.5 rounded-xl border border-success-soft">
            <Navigation size={14} color={AppColors.status.success} />
            <Text className="text-[11px] text-success-strong font-semibold ml-1">Hội An thong dong</Text>
          </View>
        </View>

        {/* Footer Stats */}
        <View className="flex-row justify-between items-center border-t border-gray-50 pt-3">
          <View className="flex-row space-x-5">
            <StatItemView icon={<Heart size={18} color="#666" />} value={stats.likes} />
            <StatItemView icon={<MessageCircle size={18} color="#666" />} value={stats.comments} />
            <StatItemView icon={<Eye size={18} color="#666" />} value={stats.views} />
          </View>
          <TouchableOpacity>
            <Text className="text-primary font-bold text-xs">Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};