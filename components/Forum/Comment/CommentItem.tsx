import React from 'react';
import { View, Text, Image } from 'react-native';
import { ForumComment } from '../../../services/forumService/forum.type';
import { CommentActions } from './CommentActions';

interface Props {
  comment: ForumComment;
  level?: number; // Cấp độ thụt lề: 0 là cha, 1 là con...
  currentUserId: string; // Để kiểm tra quyền sở hữu
  onReply: (comment: ForumComment) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CommentItem: React.FC<Props> = ({ 
  comment, 
  level = 0, 
  currentUserId,
  onReply, 
  onLike,
  onDelete 
}) => {
  const isOwner = comment.author.id === currentUserId;
  const isLiked = comment.liked_by.includes(currentUserId);

  return (
    <View style={{ marginLeft: level > 0 ? 20 : 0 }} className="mb-4">
      {/* Nội dung bình luận */}
      <View className="flex-row items-start">
        <Image 
          source={{ uri: comment.author.avatar || 'https://via.placeholder.com/40' }} 
          className="w-10 h-10 rounded-full"
        />
        <View className="flex-1 ml-2 bg-gray-100 p-3 rounded-2xl rounded-tl-none">
          <Text className="font-bold text-gray-900 text-sm">{comment.author.fullName}</Text>
          <Text className="text-gray-800 text-sm mt-1">{comment.content}</Text>
        </View>
      </View>

      {/* Các nút tương tác */}
      <CommentActions 
        isLiked={isLiked}
        likeCount={comment.liked_by.length}
        onLike={() => onLike(comment._id)}
        onReply={() => onReply(comment)}
        onDelete={() => onDelete(comment._id)}
        isOwner={isOwner}
      />

      {/* ĐỆ QUY: Render các bình luận phản hồi nếu có */}
      {comment.replies && comment.replies.length > 0 && (
        <View className="mt-2 border-l border-gray-200">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              level={level + 1} // Tăng cấp độ để thụt lề thêm
              currentUserId={currentUserId}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  );
};