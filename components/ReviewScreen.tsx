import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { PlacesService } from '../services/placeService/place.service';
import { Place } from '../services/placeService/place.type';
import { ReviewService } from '../services/reviewService/review.service';
import { Review, CreateReviewPayload, UpdateReviewPayload } from '../services/reviewService/review.type';
import { UsersService } from '../services/userService/user.service';
import { User } from '../services/userService/user.type';
import { BottomTabBar, MainTab } from './BottomTabBar';

// --- ICONS ---
const ArrowLeftIcon = ({ color = "#1F2937" }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M15 18l-6-6 6-6" />
    </Svg>
);

const StarIcon = ({ color = "#F59E0B", fill = "none" }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
);

const MapPinIcon = ({ color = "#000000" }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </Svg>
);

const ChevronRightIcon = ({ color = "#000000" }) => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 18l6-6-6-6" />
    </Svg>
);

interface ReviewScreenProps {
    placeId: string;
    onBack: () => void;
    activeTab: MainTab;
    onTabChange: (tab: MainTab) => void;
}

const getReviewId = (review: Review): string => {
    return (review as any)._id || (review as any).id || '';
};

// Modal có 3 chế độ: xem + nút sửa/xóa | form sửa | xác nhận xóa
type ModalMode = 'none' | 'view' | 'edit';

export const ReviewScreen = ({ placeId, onBack, activeTab, onTabChange }: ReviewScreenProps) => {
    const [place, setPlace] = useState<Place | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form gửi đánh giá mới (luôn hiển thị)
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>('none');
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    // Form sửa bên trong modal
    const [editRating, setEditRating] = useState<number>(0);
    const [editComment, setEditComment] = useState<string>('');

    useEffect(() => {
        fetchInitialData();
    }, [placeId]); // eslint-disable-line react-hooks/exhaustive-deps

    const closeModal = () => {
        setModalMode('none');
        setSelectedReview(null);
        setEditRating(0);
        setEditComment('');
    };

    const fetchInitialData = async () => {
        try {
            setIsLoadingInit(true);
            const [userRes, placeRes, reviewsRes] = await Promise.all([
                UsersService.getMe().catch(() => null),
                PlacesService.findOne(placeId),
                ReviewService.findAllByPlace(placeId, { limit: 10, sort_order: 'DESC' })
            ]);

            const fetchedPlace = (placeRes as any).data || placeRes;
            const fetchedReviews = reviewsRes.data || [];

            setPlace(fetchedPlace);
            setReviews(fetchedReviews);

            if (fetchedPlace && reviewsRes.meta) {
                const totalReviews = reviewsRes.meta.total || fetchedReviews.length;
                let avgRating = 0;
                if (fetchedReviews.length > 0) {
                    const totalScore = fetchedReviews.reduce((sum: number, r: Review) =>
                        sum + (r.criteria?.cleanliness || r.rating || 5), 0);
                    avgRating = Number((totalScore / fetchedReviews.length).toFixed(1));
                }
                setPlace({ ...fetchedPlace, reviewCount: totalReviews, rating: avgRating });
            }

            if (userRes) setCurrentUser(userRes);

        } catch (error) {
            console.error("Error fetching review screen data:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin lúc này.");
        } finally {
            setIsLoadingInit(false);
        }
    };

    const fetchReviewsOnly = async () => {
        try {
            const res = await ReviewService.findAllByPlace(placeId, { limit: 10, sort_order: 'DESC' });
            const fetchedReviews = res.data || [];
            setReviews(fetchedReviews);

            const totalReviews = res.meta?.total || fetchedReviews.length;
            let avgRating = 0;
            if (fetchedReviews.length > 0) {
                const totalScore = fetchedReviews.reduce((sum: number, r: Review) =>
                    sum + (r.criteria?.cleanliness || r.rating || 5), 0);
                avgRating = Number((totalScore / fetchedReviews.length).toFixed(1));
            }
            setPlace(prev => prev ? { ...prev, reviewCount: totalReviews, rating: avgRating } : null);
        } catch {
            console.error("Error refreshing reviews");
        }
    };

    // Gửi đánh giá mới
    const handleSubmitReview = async () => {
        if (rating === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá.");
            return;
        }
        try {
            setIsSubmitting(true);
            const payload: CreateReviewPayload = {
                place_id: placeId,
                content: comment.trim(),
                cleanliness: rating,
                service: rating,
                location: rating,
                price: rating,
                is_anonymous: false
            };
            await ReviewService.create(payload);
            Alert.alert("Thành công", "Cảm ơn bạn đã gửi đánh giá!");
            setRating(0);
            setComment('');
            await fetchReviewsOnly();
        } catch (error: any) {
            console.error("Create error:", error);
            Alert.alert("Thất bại", error.message || "Không thể gửi đánh giá, vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Nhấn vào thẻ đánh giá của mình → mở modal chế độ 'view'
    const handleReviewPress = (review: Review) => {
        if (!currentUser) return;
        const mine = review.user?.id === currentUser.id || (review as any).user_id === currentUser.id;
        if (!mine) return;
        setSelectedReview(review);
        setModalMode('view');
    };

    // Chuyển sang chế độ sửa trong modal
    const handleStartEdit = () => {
        if (!selectedReview) return;
        setEditRating(selectedReview.criteria?.cleanliness || selectedReview.rating || 5);
        setEditComment(selectedReview.content || '');
        setModalMode('edit');
    };

    // Xác nhận xóa (vẫn dùng Alert của hệ thống cho action nguy hiểm)
    const handleConfirmDelete = () => {
        const reviewToDelete = selectedReview;
        closeModal();

        Alert.alert(
            "Xóa đánh giá",
            "Bạn có chắc chắn muốn xóa đánh giá này không?",
            [
                { text: "Bỏ qua", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        if (!reviewToDelete) return;
                        const reviewId = getReviewId(reviewToDelete);
                        if (!reviewId) {
                            Alert.alert("Lỗi", "Không tìm thấy ID đánh giá.");
                            return;
                        }
                        try {
                            setIsSubmitting(true);
                            await ReviewService.remove(reviewId);
                            await fetchReviewsOnly();
                            Alert.alert("Thành công", "Đã xóa đánh giá.");
                        } catch (err: any) {
                            const status = err?.response?.status;
                            const msg = status === 403
                                ? "Chỉ có thể xóa đánh giá trong vòng 48 giờ sau khi gửi."
                                : (err?.response?.data?.message || err.message || "Không thể xóa đánh giá, vui lòng thử lại sau.");
                            Alert.alert("Không thể xóa", msg);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    // Gửi cập nhật đánh giá (từ form trong modal)
    const handleSubmitEdit = async () => {
        if (!selectedReview) return;
        if (editRating === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá.");
            return;
        }

        const reviewId = getReviewId(selectedReview);
        if (!reviewId) {
            Alert.alert("Lỗi", "Không tìm thấy ID đánh giá.");
            return;
        }

        // Debug log — giúp kiểm tra ID và payload trước khi gọi API
        console.log("[DEBUG] Updating review id:", reviewId);
        console.log("[DEBUG] Payload:", { editRating, editComment });

        try {
            setIsSubmitting(true);

            const updatePayload: UpdateReviewPayload = {
                criteria: {
                    cleanliness: editRating,
                    service: editRating,
                    location: editRating,
                    price: editRating
                },
                content: editComment.trim()
            };

            await ReviewService.update(reviewId, updatePayload);

            closeModal();
            await fetchReviewsOnly();
            Alert.alert("Thành công", "Đã cập nhật đánh giá của bạn.");

        } catch (error: any) {
            const status = error?.response?.status;
            const msg = status === 403
                ? "Chỉ có thể sửa đánh giá trong vòng 48 giờ sau khi gửi."
                : (error?.response?.data?.message || error.message || "Không thể cập nhật đánh giá.");
            Alert.alert("Không thể cập nhật", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER HELPERS ---
    const renderStarSelector = (value: number, onChange: (v: number) => void, size = 20) => (
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={`star-sel-${star}`} onPress={() => onChange(star)}>
                    <Svg width={size} height={size} viewBox="0 0 24 24"
                        fill={star <= value ? "#F59E0B" : "none"}
                        stroke={star <= value ? "#F59E0B" : "#D1D5DB"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </Svg>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderReviewStars = (value: number, size = 16) => (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Svg key={`star-${star}`} width={size} height={size} viewBox="0 0 24 24"
                    fill={star <= value ? "#F59E0B" : "none"}
                    stroke={star <= value ? "#F59E0B" : "#D1D5DB"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </Svg>
            ))}
        </View>
    );

    const formatRelativeTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) return 'Hôm nay';
            if (diffDays === 2) return '1 ngày trước';
            if (diffDays <= 7) return `${diffDays - 1} ngày trước`;
            if (diffDays <= 30) return `${Math.floor(diffDays / 7)} tuần trước`;
            return date.toLocaleDateString('vi-VN');
        } catch { return ''; }
    };

    const isMyReview = (review: Review) => {
        if (!currentUser) return false;
        return review.user?.id === currentUser.id || (review as any).user_id === currentUser.id;
    };

    if (isLoadingInit) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="flex-row items-center pt-14 pb-4 px-4 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={onBack} className="w-10 h-10 items-start justify-center">
                    <ArrowLeftIcon />
                </TouchableOpacity>
                <Text className="text-xl font-bold flex-1 text-center pr-10">Đánh giá địa điểm</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

                {/* 1. Thông tin địa điểm */}
                {place && (
                    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                        <Text className="text-xl font-bold text-slate-900 mb-2">{place.name}</Text>
                        <View className="flex-row items-center mb-2">
                            <StarIcon color="#F59E0B" fill="none" />
                            <Text className="text-base font-bold ml-1.5 mr-1">
                                {place.rating ? Number(place.rating).toFixed(1) : 'Chưa có'}
                            </Text>
                            <Text className="text-slate-500 text-sm">({place.reviewCount || 0} đánh giá)</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MapPinIcon />
                            <Text className="text-slate-600 text-sm ml-1.5 flex-1" numberOfLines={1}>{place.address}</Text>
                        </View>
                    </View>
                )}

                {/* 2. Form gửi đánh giá mới (luôn hiển thị) */}
                <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                    <Text className="text-base font-bold text-slate-900 mb-2">Viết đánh giá</Text>
                    {renderStarSelector(rating, setRating)}
                    <View className="bg-slate-100 rounded-xl px-3 py-2 mb-4 h-24">
                        <TextInput
                            className="bg-transparent text-slate-800 flex-1 text-sm"
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                            value={comment}
                            onChangeText={setComment}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleSubmitReview}
                        disabled={isSubmitting}
                        className={`w-full py-3.5 rounded-xl items-center justify-center ${isSubmitting ? 'bg-blue-300' : 'bg-blue-500'}`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-base">Gửi đánh giá</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* 3. Danh sách đánh giá */}
                <View className="bg-white rounded-2xl p-4 shadow-sm mb-8">
                    <Text className="text-base font-bold text-slate-900 mb-4">Đánh giá gần đây</Text>

                    {reviews.length === 0 ? (
                        <Text className="text-slate-500 text-center py-4">Chưa có đánh giá nào.</Text>
                    ) : (
                        reviews.map((review, index) => {
                            const mine = isMyReview(review);
                            return (
                                <TouchableOpacity
                                    key={getReviewId(review) || index}
                                    activeOpacity={mine ? 0.7 : 1}
                                    onPress={() => handleReviewPress(review)}
                                    style={{
                                        flexDirection: 'row',
                                        marginTop: 16,
                                        paddingBottom: index !== reviews.length - 1 ? 16 : 0,
                                        borderBottomWidth: index !== reviews.length - 1 ? 1 : 0,
                                        borderBottomColor: '#F1F5F9',
                                        ...(mine ? { backgroundColor: '#F0F7FF', borderRadius: 12, padding: 8 } : {})
                                    }}
                                >
                                    <Image
                                        source={{ uri: review.user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }}
                                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 14 }}>
                                                {review.user?.fullName || 'Người dùng ẩn danh'}
                                                {mine && <Text style={{ color: '#93C5FD', fontSize: 11 }}> (bạn)</Text>}
                                            </Text>
                                            {mine && <ChevronRightIcon color="#2B8EF0" />}
                                        </View>
                                        <View style={{ marginBottom: 6 }}>
                                            {renderReviewStars(review.criteria?.cleanliness || review.rating || 5)}
                                        </View>
                                        <Text style={{ color: '#374151', fontSize: 13, marginBottom: 6, lineHeight: 18 }}>{review.content}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 11 }}>{formatRelativeTime(review.created_at)}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

            </ScrollView>

            {/* ===== MODAL: xem / sửa đánh giá ===== */}
            <Modal
                visible={modalMode !== 'none'}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                {/* Nền mờ — nhấn ra ngoài để đóng & hủy */}
                <TouchableOpacity
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}
                    activeOpacity={1}
                    onPress={closeModal}
                >
                    {/* Ô cửa sổ — chặn sự kiện nhấn lan ra ngoài */}
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {}}
                        style={{
                            width: '84%',
                            backgroundColor: 'white',
                            borderRadius: 20,
                            overflow: 'hidden',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.18,
                            shadowRadius: 24,
                            elevation: 12,
                        }}
                    >
                        {/* ---- Chế độ XEM (có nút Sửa / Xóa ở dưới) ---- */}
                        {modalMode === 'view' && selectedReview && (
                            <>
                                <View style={{ padding: 20, paddingBottom: 16 }}>
                                    {/* Avatar + tên + sao */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <Image
                                            source={{ uri: selectedReview.user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }}
                                            style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10 }}
                                        />
                                        <View>
                                            <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14 }}>
                                                {selectedReview.user?.fullName || 'Bạn'}
                                            </Text>
                                            <View style={{ marginTop: 4 }}>
                                                {renderReviewStars(selectedReview.criteria?.cleanliness || selectedReview.rating || 5)}
                                            </View>
                                        </View>
                                    </View>
                                    {/* Nội dung */}
                                    <Text style={{ color: '#374151', fontSize: 14, lineHeight: 20 }}>
                                        {selectedReview.content}
                                    </Text>
                                </View>

                                {/* Đường kẻ */}
                                <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />

                                {/* Nút Sửa / Xóa */}
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        onPress={handleStartEdit}
                                        style={{ flex: 1, paddingVertical: 15, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F1F5F9' }}
                                    >
                                        <Text style={{ color: '#2B8EF0', fontWeight: '600', fontSize: 15 }}>Sửa</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleConfirmDelete}
                                        style={{ flex: 1, paddingVertical: 15, alignItems: 'center' }}
                                    >
                                        <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 15 }}>Xóa</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* ---- Chế độ SỬA (form bên trong modal) ---- */}
                        {modalMode === 'edit' && (
                            <>
                                {/* Tiêu đề + nút Hủy */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 }}>
                                    <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 16 }}>Sửa đánh giá</Text>
                                    <TouchableOpacity onPress={closeModal}>
                                        <Text style={{ color: '#94A3B8', fontWeight: '600', fontSize: 14 }}>Hủy</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 }}>
                                    {/* Chọn sao */}
                                    {renderStarSelector(editRating, setEditRating, 26)}

                                    {/* Ô nhập nội dung */}
                                    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, minHeight: 100, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                        <TextInput
                                            style={{ color: '#1e293b', fontSize: 14, textAlignVertical: 'top', flex: 1 }}
                                            placeholder="Chia sẻ trải nghiệm của bạn..."
                                            placeholderTextColor="#94A3B8"
                                            multiline
                                            value={editComment}
                                            onChangeText={setEditComment}
                                        />
                                    </View>

                                    {/* Nút Cập nhật */}
                                    <TouchableOpacity
                                        onPress={handleSubmitEdit}
                                        disabled={isSubmitting}
                                        style={{
                                            backgroundColor: isSubmitting ? '#93C5FD' : '#2B8EF0',
                                            borderRadius: 12,
                                            paddingVertical: 14,
                                            alignItems: 'center',
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Cập nhật đánh giá</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <BottomTabBar activeTab={activeTab} onTabPress={onTabChange} />
        </SafeAreaView>
    );
};
