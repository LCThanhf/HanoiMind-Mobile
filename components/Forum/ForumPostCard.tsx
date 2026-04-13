import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, MessageCircle, Eye, Heart, Navigation, MoreVertical } from 'lucide-react-native';
import { ForumPost } from '../../services/forumService/forum.type';
import { ForumService } from '../../services/forumService/forum.service';
import { UsersService } from '../../services/userService/user.service';
import { PlacesService } from '../../services/placeService/place.service';
import { Button, PillBadge, StatItemView } from '../shared';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostFooter } from './PostFooter';

interface ForumPostCardProps {
  post?: ForumPost;
  postId?: string;
  onPress?: () => void;
}

export const ForumPostCard = ({ post: initialPost, postId, onPress }: ForumPostCardProps) => {
  const [post, setPost] = useState<ForumPost | null>(initialPost || null);
  const [loading, setLoading] = useState<boolean>(!initialPost && !!postId);
  const [error, setError] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(initialPost?.stats?.likes || 0);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await UsersService.getMe();
        if (user && user._id) {
          setCurrentUserId(user._id);
        }
      } catch (err) {
        console.error('Error getting current user:', err);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (post) {
      setLikesCount(post.stats?.likes ?? 0);
    }
  }, [post]);

  const isLiked = Boolean(currentUserId && post?.liked_by?.includes(currentUserId));

  const handleToggleLike = async () => {
    if (!post?._id || !currentUserId || likeLoading) return;

    const previousLikes = likesCount;
    const newLikeState = !isLiked;

    setLikesCount((prev) => (newLikeState ? prev + 1 : Math.max(0, prev - 1)));
    setLikeLoading(true);

    try {
      const updated = await ForumService.toggleLike(post._id);
      setPost(updated);

      setLikesCount(updated.stats?.likes ?? (newLikeState ? previousLikes + 1 : Math.max(0, previousLikes - 1)));
    } catch (err) {
      console.error('Error toggling like:', err);
      setLikesCount(previousLikes);
    } finally {
      setLikeLoading(false);
    }
  };

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

// Khai báo state lưu mảng tên địa điểm
const [placeNames, setPlaceNames] = useState<string[]>([]);


useEffect(() => {
  const loadPlaceNames = async () => {
    
    // Kiểm tra cả place_ids lẫn places (API có thể trả về places object thay vì place_ids string)
    const placeIds = post?.place_ids;
    const places = (post as any)?.places;
    
    
    // Nếu dữ liệu đã có sẵn trong places object
    if (places && Array.isArray(places) && places.length > 0) {
      const directNames = places.map((p: any) => p?.name || "Không tìm thấy tên");
      setPlaceNames(directNames);
      return;
    }
    
    // Nếu chỉ có place_ids, phải gọi API để lấy tên
    if (!placeIds || placeIds.length === 0) {
      setPlaceNames([]);
      return;
    }


    try {
      const namePromises = placeIds.map(async (id) => {
        try {
          if (!id) {
            return "ID trống";
          }

          // apiClient đã unwrap response, nên res là Place object trực tiếp
          const res = await PlacesService.findOne(id);
        
          
          // res là Place object: { _id, name, ... }
          const placeName = (res as any)?.name || "Không tìm thấy tên";
          
          return placeName;
        } catch (err) {
          return "Lỗi API";
        }
      });

      const names = await Promise.all(namePromises);
      setPlaceNames(names);
      
    } catch (err) {
      setPlaceNames([]);
    }
  };

  loadPlaceNames();
}, [post?.place_ids?.join(','), (post as any)?.places?.length]); // Trigger nếu place_ids hoặc places thay đổi


  const handleEdit = () => {
    Alert.alert('Chỉnh sửa', 'Chức năng chỉnh sửa chưa được implement.');
  };

  const handleDelete = async () => {
    if (!post?._id) return;

    try {
      await ForumService.deletePost(post._id);
      Alert.alert('Thành công', 'Bài viết đã được xóa.');
      // Có lẽ cần refresh list, nhưng vì là card, có lẽ parent handle
    } catch (err) {
      console.error('Error deleting post:', err);
      Alert.alert('Lỗi', 'Không thể xóa bài viết.');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      className="bg-white m-4 rounded-[32px] shadow-sm border border-gray-100"
    >
      <PostHeader 
        author={author}
        status={post.status} 
        createdAt={post.created_at || new Date().toISOString()}
        onEdit={post.author?.id === currentUserId ? handleEdit : undefined}
        onDelete={post.author?.id === currentUserId ? handleDelete : undefined}
      />
      
      <PostContent 
        imageUri={imageUri} 
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
    </TouchableOpacity>
  );
};
