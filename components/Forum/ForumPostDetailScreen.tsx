import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { ForumPost } from '../../services/forumService/forum.type';
import { ForumService } from '../../services/forumService/forum.service';
import { UsersService } from '../../services/userService/user.service';
import { PlacesService } from '../../services/placeService/place.service';
import { PostHeader } from './PostHeader';
import { PostDetailContent } from './PostDetailContent';
import { PostFooter } from './PostFooter';
import { AppColors } from '../../utils/theme';

interface ForumPostDetailScreenProps {
  postId: string;
  onBack: () => void;
  onEdit?: () => void;
}

export const ForumPostDetailScreen = ({ postId, onBack, onEdit }: ForumPostDetailScreenProps) => {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(0);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [placeNames, setPlaceNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await UsersService.getMe();
        if (user?._id) setCurrentUserId(user._id);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError('');

      try {
        const fetched = await ForumService.getPostDetail(postId);
        setPost(fetched);
        setLikesCount(fetched.stats?.likes ?? 0);
      } catch (err) {
        console.error('Error loading forum post detail:', err);
        setError('Không tải được chi tiết bài viết.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  useEffect(() => {
    const loadPlaceNames = async () => {
      if (!post) return;

      const placeIds = post.place_ids;
      const places = (post as any)?.places;

      if (places && Array.isArray(places) && places.length > 0) {
        setPlaceNames(places.map((p: any) => p?.name || 'Không tìm thấy tên'));
        return;
      }

      if (!placeIds || placeIds.length === 0) {
        setPlaceNames([]);
        return;
      }

      try {
        const namePromises = placeIds.map(async (id) => {
          try {
            const res = await PlacesService.findOne(id);
            return (res as any)?.name || 'Không tìm thấy tên';
          } catch (err) {
            return 'Lỗi API';
          }
        });

        const names = await Promise.all(namePromises);
        setPlaceNames(names);
      } catch (err) {
        setPlaceNames([]);
      }
    };

    loadPlaceNames();
  }, [post]);

  const isLiked = Boolean(currentUserId && post?.liked_by?.includes(currentUserId));

  const handleToggleLike = async () => {
    if (!post?._id || !currentUserId || likeLoading) return;

    const previousLikes = likesCount;
    const newLikeState = !isLiked;
    setLikesCount(newLikeState ? previousLikes + 1 : Math.max(0, previousLikes - 1));
    setLikeLoading(true);

    try {
      const updatedPost = await ForumService.toggleLike(post._id);
      setPost(updatedPost);
      setLikesCount(updatedPost.stats?.likes ?? (newLikeState ? previousLikes + 1 : Math.max(0, previousLikes - 1)));
    } catch (err) {
      console.error('Error toggling like:', err);
      setLikesCount(previousLikes);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleDelete = async () => {
    if (!post?._id) return;

    try {
      await ForumService.deletePost(post._id);
      Alert.alert('Thành công', 'Bài viết đã được xóa.');
      onBack();
    } catch (err) {
      console.error('Error deleting post:', err);
      Alert.alert('Lỗi', 'Không thể xóa bài viết.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={AppColors.status.info} />
          <Text className="text-gray-500 mt-3">Đang tải chi tiết bài viết...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView className="flex-1 bg-white px-4 pt-12">
        <TouchableOpacity onPress={onBack} className="mb-4">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="rounded-3xl border border-red-100 bg-white p-6">
          <Text className="text-red-500 mb-4">{error || 'Bài viết không tồn tại.'}</Text>
          <TouchableOpacity
            onPress={async () => {
              setError('');
              setLoading(true);
              try {
                const fetched = await ForumService.getPostDetail(postId);
                setPost(fetched);
                setLikesCount(fetched.stats?.likes ?? 0);
              } catch (err) {
                console.error('Retry error loading forum post detail:', err);
                setError('Không tải được chi tiết bài viết.');
              } finally {
                setLoading(false);
              }
            }}
            className="bg-primary rounded-full px-4 py-3"
          >
            <Text className="text-white text-center">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={onBack} className="p-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-lg text-primary mr-10">Chi tiết bài viết</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="m-4 rounded-[32px] border border-gray-100 bg-white shadow-sm">
          <PostHeader
            author={post.author || { fullName: 'Người dùng' }}
            status={post.status}
            createdAt={post.created_at || new Date().toISOString()}
            onEdit={post.author?.id === currentUserId ? handleEdit : undefined}
            onDelete={post.author?.id === currentUserId ? handleDelete : undefined}
          />

          <PostDetailContent
            images={Array.isArray(post.images) ? post.images : []}
            title={post.title}
            content={post.content}
            tags={Array.isArray(post.tag) ? post.tag : []}
          />

          <PostFooter
            placeNames={placeNames}
            journeyId={post.journey_id}
            likesCount={likesCount}
            isLiked={isLiked}
            likeLoading={likeLoading}
            commentsCount={post.stats?.comments || 0}
            viewsCount={post.stats?.views || 0}
            onLikePress={handleToggleLike}
            disabledLike={!currentUserId || likeLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
