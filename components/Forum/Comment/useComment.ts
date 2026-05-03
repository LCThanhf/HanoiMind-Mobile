import { useState } from 'react';
import { ForumService } from '../../../services/forumService/forum.service';
import { ForumComment } from '../../../services/forumService/forum.type';

export const useComments = (postId: string, currentUserId: string, initialComments: ForumComment[] = []) => {
  const [comments, setComments] = useState<ForumComment[]>(initialComments);

  // Xử lý Thêm bình luận/Reply
  const onAddComment = async (content: string, parentId?: string) => {
    try {
      const response = await ForumService.addComment(postId, content, parentId);
      if (parentId) {
        // Cập nhật vào cây replies (Đệ quy)
        setComments(prev => insertReply(prev, parentId, response));
      } else {
        setComments(prev => [response, ...prev]);
      }
    } catch (error) { console.error(error); }
  };

  const insertReply = (list: ForumComment[], parentId: string, reply: ForumComment): ForumComment[] => {
    return list.map(comment => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: [reply, ...(comment.replies || [])]
        };
      }
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: insertReply(comment.replies, parentId, reply)
        };
      }
      return comment;
    });
  };

  // Xử lý Like/Bỏ like bình luận
  const onLikeComment = async (commentId: string) => {
    try {
      await ForumService.toggleLikeComment(commentId);
      // Cập nhật local state: Toggle like cho comment
      setComments(prev => toggleLikeInTree(prev, commentId, currentUserId));
    } catch (error) { console.error(error); }
  };

  const toggleLikeInTree = (list: ForumComment[], id: string, userId: string): ForumComment[] => {
    return list.map(c => {
      if (c._id === id) {
        const isLiked = c.liked_by.includes(userId);
        return {
          ...c,
          liked_by: isLiked ? c.liked_by.filter(uid => uid !== userId) : [...c.liked_by, userId]
        };
      }
      if (c.replies?.length) return { ...c, replies: toggleLikeInTree(c.replies, id, userId) };
      return c;
    });
  };

  // Xử lý Xóa bình luận
  const onDeleteComment = async (commentId: string) => {
    try {
      await ForumService.deleteComment(commentId);
      // Cập nhật local state: Lọc bỏ comment đã xóa khỏi cây
      setComments(prev => removeFromTree(prev, commentId));
    } catch (error) { console.error(error); }
  };

  const removeFromTree = (list: ForumComment[], id: string): ForumComment[] => {
    return list
      .filter(c => c._id !== id)
      .map(c => ({ ...c, replies: c.replies ? removeFromTree(c.replies, id) : [] }));
  };

  return { comments, onAddComment, onLikeComment, onDeleteComment };
};