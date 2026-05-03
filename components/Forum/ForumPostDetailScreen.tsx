import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { ForumPost, ForumComment } from '../../services/forumService/forum.type';
import { ForumService } from '../../services/forumService/forum.service';
import { UsersService } from '../../services/userService/user.service';
import { PlacesService } from '../../services/placeService/place.service';
import { PostHeader } from './PostHeader';
import { PostDetailContent } from './PostDetailContent';
import { PostFooter } from './PostFooter';
import { CommentList } from './Comment/CommentList';
import { CommentInput } from './Comment/CommentInput';
import { useComments } from './Comment/useComment';
import { AppColors } from '../../utils/theme';

type ForumPostDetail = ForumPost & { comments?: ForumComment[]; journey_summary?: any };

interface ForumPostDetailScreenProps {
  postId: string;
  onBack: () => void;
  onEdit?: () => void;
  onOpenPlaceDetail?: (placeId: string) => void;
}

export const ForumPostDetailScreen = ({ postId, onBack, onEdit, onOpenPlaceDetail }: ForumPostDetailScreenProps) => {
  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(0);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [detailPlaces, setDetailPlaces] = useState<{id: string, name: string}[]>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const { comments, onAddComment, onLikeComment, onDeleteComment } = useComments(postId, currentUserId, post?.comments || []);

  useEffect(() => {
    // Khi post load xong, cập nhật comments
    if (post?.comments) {
      // Có lẽ cần reset comments trong hook, nhưng tạm thời để vậy
    }
  }, [post?.comments]);

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

  // tag địa điểm 
  useEffect(() => {
  const loadPlaceDetails = async () => {
    if (!post || !post.place_ids || post.place_ids.length === 0) {
      setDetailPlaces([]);
      return;
    }

    try {
      const details = await Promise.all(
        post.place_ids.map(async (id) => {
          try {
            const res = await PlacesService.findOne(id);
            return {
              id: id,
              name: (res as any)?.name || 'Địa điểm không tên'
            };
          } catch (err) {
            return { id: id, name: 'Lỗi tải địa điểm' };
          }
        })
      );
      setDetailPlaces(details);
      console.log('ForumPostDetailScreen: Loaded detailPlaces for post', post?._id, details);
    } catch (err) {
      console.error('Error loading places:', err);
      setDetailPlaces([]);
    }
  };

  loadPlaceDetails();
}, [post]); // Chạy lại mỗi khi bài viết (post) thay đổi

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

  const handlePlacePress = (placeId: string) => {
    console.log('ForumPostDetailScreen: Navigating to place:', placeId);
    if (!placeId || placeId.trim() === '') {
      console.warn('ForumPostDetailScreen: Invalid placeId, skipping navigation');
      return;
    }
    if (onOpenPlaceDetail) {
      onOpenPlaceDetail(placeId);
      return;
    }

    console.warn('Không có callback onOpenPlaceDetail để điều hướng đến chi tiết địa điểm.', placeId);
  };

  const handleReply = (comment: any) => {
    setReplyingTo(comment.author);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSubmitComment = (content: string) => {
    onAddComment(content, replyingTo ? replyingTo._id : undefined);
    setReplyingTo(null);
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
            place={detailPlaces} // Truyền mảng object đã xử lý ở trên
            onPlacePress={handlePlacePress} // Truyền hàm điều hướng
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

        <CommentList
          comments={comments}
          onReply={handleReply}
          onLike={onLikeComment}
          onDelete={onDeleteComment}
          currentUserId={currentUserId}
        />
      </ScrollView>

      <CommentInput
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        onSubmit={handleSubmitComment}
      />
    </SafeAreaView>
  );
};
