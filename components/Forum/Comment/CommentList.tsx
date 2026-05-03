import React from 'react';
import { View, Text } from 'react-native';
import { ForumComment } from '../../../services/forumService/forum.type';
import { CommentItem } from './CommentItem';

interface Props {
  comments: ForumComment[];
  onReply: (comment: ForumComment) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAuthor?: (userId: string) => void;
  currentUserId: string;
}

export const CommentList: React.FC<Props> = ({ comments, onReply, onLike, onDelete, onOpenAuthor, currentUserId }) => {
  return (
    <View className="mt-6 px-4 pb-20">
      <Text className="text-lg font-bold mb-4 text-gray-900">
        Bình luận ({comments.length})
      </Text>
      
      {comments.length > 0 ? (
        comments.map((item) => (
          <CommentItem 
            key={item._id} 
            comment={item} 
            onReply={onReply} 
            onLike={onLike} 
            currentUserId={currentUserId} 
            onDelete={onDelete}
            onOpenAuthor={onOpenAuthor}
          />
        ))
      ) : (
        <Text className="text-gray-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
      )}
    </View>
  );
};