import React from 'react';
import { View, Text, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Review } from '../../services/reviewService/review.type';
import { Button } from '../shared';

export const formatRelativeTime = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} năm trước`;
  } catch {
    return '';
  }
};

const ChevronRightIcon = ({ color = '#000000' }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const renderReviewStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Svg key={`star-${i}`} width={12} height={12} viewBox="0 0 24 24" fill={i <= rating ? '#F59E0B' : '#E2E8F0'}>
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </Svg>
    );
  }
  return <View style={{ flexDirection: 'row', gap: 2 }}>{stars}</View>;
};

interface ReviewCardProps {
  review: Review;
  isMine: boolean;
  isLast: boolean;
  onPress?: (review: Review) => void;
  onReact?: (review: Review, type: 'LIKE' | 'DISLIKE') => void;
  reactionStatus?: 'LIKE' | 'DISLIKE' | null;
}

export const ReviewCard = ({
  review,
  isMine,
  isLast,
  onPress,
  onReact,
  reactionStatus
}: ReviewCardProps) => {

  const reviewId = (review as any)._id || (review as any).id || '';

  return (
    <Button
      key={reviewId}
      activeOpacity={isMine ? 0.7 : 1}
      onPress={() => { if (isMine && onPress) onPress(review); }}
      style={{
        flexDirection: 'row',
        marginTop: 16,
        paddingBottom: !isLast ? 16 : 0,
        borderBottomWidth: !isLast ? 1 : 0,
        borderBottomColor: '#F1F5F9',
        ...(isMine
          ? {
            backgroundColor: '#F0F7FF',
            borderRadius: 12,
            padding: 8,
          }
          : {}),
      }}
    >
      <Image
        source={{
          uri:
            review.user?.avatar ||
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              color: '#0f172a',
              fontSize: 14,
            }}
          >
            {review.user?.fullName || 'Người dùng ẩn danh'}
            {isMine && (
              <Text style={{ color: '#BFDBFE', fontSize: 11 }}>
                {' '}
                (bạn)
              </Text>
            )}
          </Text>
          {isMine && <ChevronRightIcon color="#2B8EF0" />}
        </View>
        <View style={{ marginBottom: 6 }}>
          {renderReviewStars(
            review.criteria?.cleanliness || review.rating || 5,
          )}
        </View>
        <Text
          style={{
            color: '#374151',
            fontSize: 13,
            marginBottom: 6,
            lineHeight: 18,
          }}
        >
          {review.content}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: '#94A3B8', fontSize: 11 }}>
            {formatRelativeTime(review.created_at)}
          </Text>
          {!isMine && onReact && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                onPress={() => onReact(review, 'LIKE')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  backgroundColor: reactionStatus === 'LIKE' ? '#DBEAFE' : '#F1F5F9',
                }}
              >
                <Text style={{ fontSize: 14 }}>👍</Text>
              </Button>
              <Button
                onPress={() => onReact(review, 'DISLIKE')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  backgroundColor: reactionStatus === 'DISLIKE' ? '#FEE2E2' : '#F1F5F9',
                }}
              >
                <Text style={{ fontSize: 14 }}>👎</Text>
              </Button>
            </View>
          )}
        </View>
      </View>
    </Button>
  );
};
