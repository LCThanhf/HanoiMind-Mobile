import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { PlacesService } from '../services/placeService/place.service';
import { Place } from '../services/placeService/place.type';
import { ReviewService } from '../services/reviewService/review.service';
import { Review } from '../services/reviewService/review.type';
import { UsersService } from '../services/userService/user.service';
import { User } from '../services/userService/user.type';
import { MainTab } from './BottomTabBar';
import { Button, CardContainer, ScreenHeader, StarRating } from './shared';
import { ReviewCard } from './cards';

// --- ICONS ---
const MapPinIcon = ({ color = '#64748b' }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </Svg>
);

const EditIcon = ({ color = '#ffffff' }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const TrashIcon = ({ color = '#ef4444' }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 0h6" />
  </Svg>
);

interface ReviewScreenProps {
  placeId: string;
  onBack: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const getReviewId = (review: Review): string => (review as any)._id || (review as any).id || '';

type ModalMode = 'none' | 'view' | 'edit';

export const ReviewScreen = ({ placeId, onBack, activeTab, onTabChange }: ReviewScreenProps) => {
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>('none');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');

  useEffect(() => { fetchInitialData(); }, [placeId]);

  const isMyReview = (review: Review): boolean => {
    if (!currentUser) return false;
    const currentUserId = String((currentUser as any)._id || (currentUser as any).id || '');
    const reviewUserId = String(review.user?.id || (review.user as any)?._id || (review as any).user_id || '');
    return currentUserId !== '' && currentUserId === reviewUserId;
  };

  const hasUserReviewed = useMemo(() => reviews.some(r => isMyReview(r)), [reviews, currentUser]);

  const fetchInitialData = async () => {
    try {
      setIsLoadingInit(true);
      const [userRes, placeRes, reviewsRes] = await Promise.allSettled([
        UsersService.getMe(),
        PlacesService.findOne(placeId),
        ReviewService.findAllByPlace(placeId, { limit: 50, sort_order: 'DESC' }),
      ]);
      if (userRes.status === 'fulfilled') setCurrentUser(userRes.value);
      if (placeRes.status === 'fulfilled') setPlace((placeRes.value as any).data || placeRes.value);
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data || []);
    } finally {
      setIsLoadingInit(false);
    }
  };

  // Cập nhật lại toàn bộ dữ liệu (bao gồm cả điểm trung bình của Place)
  const refreshData = async () => {
    const [placeRes, reviewsRes] = await Promise.allSettled([
      PlacesService.findOne(placeId),
      ReviewService.findAllByPlace(placeId, { limit: 50, sort_order: 'DESC' }),
    ]);
    if (placeRes.status === 'fulfilled') setPlace((placeRes.value as any).data || placeRes.value);
    if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data || []);
  };

  const handleReviewPress = (review: Review) => {
    if (!isMyReview(review)) return;
    setSelectedReview(review);
    setEditRating(review.rating || 5);
    setEditComment(review.content || '');
    setModalMode('view');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return Alert.alert('Thông báo', 'Vui lòng chọn số sao.');
    try {
      setIsSubmitting(true);
      await ReviewService.create({
        place_id: placeId, content: comment.trim(), cleanliness: rating,
        service: rating, location: rating, price: rating, is_anonymous: false,
      });
      setRating(0); setComment('');
      await refreshData(); // Làm mới toàn bộ trang để cập nhật điểm 4 sao lên header
    } finally { setIsSubmitting(false); }
  };

  const handleSubmitEdit = async () => {
    const rId = selectedReview ? getReviewId(selectedReview) : null;
    if (!rId) return;
    try {
      setIsSubmitting(true);
      await ReviewService.update(rId, {
        content: editComment.trim(),
        criteria: { cleanliness: editRating, service: editRating, location: editRating, price: editRating }
      });
      setModalMode('none');
      await refreshData();
    } finally { setIsSubmitting(false); }
  };

  const handleConfirmDelete = () => {
    const rId = selectedReview ? getReviewId(selectedReview) : null;
    if (!rId) return;
    Alert.alert('Xóa đánh giá', 'Bạn chắc chắn muốn xóa đánh giá này chứ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            setIsSubmitting(true);
            await ReviewService.remove(rId);
            setModalMode('none');
            await refreshData();
          } finally { setIsSubmitting(false); }
        }
      },
    ]);
  };

  if (isLoadingInit) return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <ScreenHeader title="Đánh giá địa điểm" onBack={onBack} />

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {place && (
          <CardContainer style={{ padding: 20, marginBottom: 16 }}>
            <Text className="text-xl font-bold text-slate-900 mb-2">{place.name}</Text>
            {/* Điểm số này sẽ cập nhật sau khi refreshData() được gọi */}
            <StarRating rating={place.rating ? Number(place.rating) : 0} size={16} showValue />
            <View className="flex-row items-center mt-2">
              <MapPinIcon />
              <Text className="text-slate-500 text-sm ml-1.5 flex-1" numberOfLines={1}>{place.address}</Text>
            </View>
          </CardContainer>
        )}

        {!hasUserReviewed ? (
          <CardContainer style={{ padding: 20, marginBottom: 16 }}>
            <Text className="text-base font-bold text-slate-900 mb-3">Viết đánh giá</Text>
            <View className="flex-row gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill={s <= rating ? '#F59E0B' : 'none'} stroke={s <= rating ? '#F59E0B' : '#D1D5DB'} strokeWidth="2">
                    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </Svg>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              className="bg-slate-100 rounded-2xl px-4 py-3 mb-4 h-28 text-slate-800"
              placeholder="Cảm nhận của bạn về địa điểm này..."
              multiline textAlignVertical="top"
              value={comment} onChangeText={setComment}
            />
            <Button label="Gửi đánh giá" onPress={handleSubmitReview} loading={isSubmitting} style={{ borderRadius: 16, height: 56 }} />
          </CardContainer>
        ) : (
          <View className="bg-emerald-50 p-5 rounded-3xl mb-4 border border-emerald-100 items-center">
            <Text className="text-emerald-700 font-bold text-base">Cảm ơn bạn đã đánh giá!</Text>
            <Text className="text-emerald-600/70 text-xs mt-1">Bạn có thể xem lại bài viết của mình bên dưới.</Text>
          </View>
        )}

        <CardContainer style={{ padding: 20, marginBottom: 32 }}>
          <Text className="text-base font-bold text-slate-900 mb-4">Đánh giá gần đây</Text>
          {reviews.length === 0 ? (
            <Text className="text-slate-400 text-center py-8">Chưa có ai đánh giá nơi này.</Text>
          ) : (
            reviews.map((review, index) => (
              <ReviewCard
                key={getReviewId(review) || index}
                review={review}
                isMine={isMyReview(review)}
                onPress={() => handleReviewPress(review)}
                isLast={index === reviews.length - 1}
              />
            ))
          )}
        </CardContainer>
      </ScrollView>

      {/* --- MODAL CHI TIẾT --- */}
      <Modal visible={modalMode !== 'none'} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

            {modalMode === 'view' && selectedReview && (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 }}>Đánh giá của bạn</Text>
                <View style={{ marginBottom: 16 }}>
                   <StarRating rating={selectedReview.rating || 0} size={18} showValue />
                </View>

                <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 16, marginBottom: 20 }}>
                   <Text style={{ color: '#475569', fontSize: 15, lineHeight: 22 }}>"{selectedReview.content}"</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {/* Nút Xóa nằm bên trái và nhỏ gọn */}
                  <TouchableOpacity
                    onPress={handleConfirmDelete}
                    style={{ flex: 1, height: 48, backgroundColor: '#fee2e2', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <TrashIcon />
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 14 }}>Xóa bài</Text>
                  </TouchableOpacity>

                  {/* Nút Chỉnh sửa nằm bên phải */}
                  <TouchableOpacity
                    onPress={() => setModalMode('edit')}
                    style={{ flex: 1, height: 48, backgroundColor: '#3b82f6', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <EditIcon />
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Chỉnh sửa</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setModalMode('none')} style={{ marginTop: 14, alignSelf: 'center' }}>
                  <Text style={{ color: '#94a3b8', fontWeight: '600', fontSize: 14 }}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}

            {modalMode === 'edit' && (
              <>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 }}>Cập nhật đánh giá</Text>
                <View className="flex-row gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setEditRating(s)}>
                      <Svg width={32} height={32} viewBox="0 0 24 24" fill={s <= editRating ? '#F59E0B' : 'none'} stroke={s <= editRating ? '#F59E0B' : '#D1D5DB'} strokeWidth="2">
                        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </Svg>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={{ backgroundColor: '#f1f5f9', borderRadius: 20, padding: 16, height: 150, textAlignVertical: 'top', fontSize: 16 }}
                  multiline value={editComment} onChangeText={setEditComment}
                />
                <Button label="Lưu thay đổi" loading={isSubmitting} onPress={handleSubmitEdit} style={{ marginTop: 20, borderRadius: 16, height: 56 }} />
                <TouchableOpacity onPress={() => setModalMode('view')} style={{ marginTop: 16, alignSelf: 'center' }}>
                  <Text style={{ color: '#64748b', fontWeight: '600' }}>Quay lại</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};