import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PlacesService } from '../services/placeService/place.service';
import { Place } from '../services/placeService/place.type';
import { ReviewService } from '../services/reviewService/review.service';
import { Review, CreateReviewPayload, UpdateReviewPayload } from '../services/reviewService/review.type';
import { UsersService } from '../services/userService/user.service';
import { User } from '../services/userService/user.type';

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
}

export const ReviewScreen = ({ placeId, onBack }: ReviewScreenProps) => {
    const [place, setPlace] = useState<Place | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [myReview, setMyReview] = useState<Review | null>(null);
    
    // UI State
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Form State
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');

    useEffect(() => {
        fetchInitialData();
    }, [placeId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchInitialData = async () => {
        try {
            setIsLoadingInit(true);
            
            // Lấy thông tin người dùng, địa điểm và review đồng thời
            const [userRes, placeRes, reviewsRes] = await Promise.all([
                UsersService.getMe().catch(() => null), // Không lỗi nếu chưa login
                PlacesService.findOne(placeId),
                ReviewService.findAllByPlace(placeId, { limit: 10, sort_order: 'DESC' })
            ]);

            const fetchedPlace = (placeRes as any).data || placeRes;
            const fetchedReviews = reviewsRes.data || [];
            
            setPlace(fetchedPlace);
            setReviews(fetchedReviews);
            
            // Recalculate and update place.rating and place.reviewCount dynamically
            if (fetchedPlace && reviewsRes.meta) {
                const totalReviews = reviewsRes.meta.total || fetchedReviews.length;
                let avgRating = fetchedPlace.rating;
                if (fetchedReviews.length > 0) {
                    const totalScore = fetchedReviews.reduce((sum: number, r: Review) => {
                         return sum + (r.criteria?.cleanliness || r.rating || 5);
                    }, 0);
                    avgRating = Number((totalScore / fetchedReviews.length).toFixed(1));
                } else {
                    avgRating = 0;
                }
                setPlace({ ...fetchedPlace, reviewCount: totalReviews, rating: avgRating });
            }
            
            if (userRes) {
                setCurrentUser(userRes);
                const userReview = fetchedReviews.find((r: Review) => r.user?.id === userRes.id || (r as any).user_id === userRes.id);
                if (userReview) {
                    // Update fallback for consistent rating usage inside components
                    userReview.rating = userReview.criteria?.cleanliness || userReview.rating || 5;
                    setMyReview(userReview);
                }
            }
            
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
            
            // Cập nhật lại thông số tổng quát của địa điểm
            if (place) {
                const totalReviews = res.meta?.total || fetchedReviews.length;
                let avgRating = place.rating;
                if (fetchedReviews.length > 0) {
                    const totalScore = fetchedReviews.reduce((sum: number, r: Review) => {
                         return sum + (r.criteria?.cleanliness || r.rating || 5);
                    }, 0);
                    avgRating = Number((totalScore / fetchedReviews.length).toFixed(1));
                } else {
                    avgRating = 0;
                }
                setPlace(prev => prev ? { ...prev, reviewCount: totalReviews, rating: avgRating } : null);
            }
            
            if (currentUser) {
                const userReview = fetchedReviews.find((r: Review) => r.user?.id === currentUser.id || (r as any).user_id === currentUser.id);
                if (userReview) {
                    userReview.rating = userReview.criteria?.cleanliness || userReview.rating || 5;
                }
                setMyReview(userReview || null);
            }
        } catch {
            console.error("Error refreshing reviews");
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá.");
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Xây dựng payload theo type bắt buộc
            const payload: CreateReviewPayload = {
                place_id: placeId,
                content: comment.trim(),
                cleanliness: rating, // Gán chung cho tất cả các tiêu chí vì UI chỉ có text chung
                service: rating,
                location: rating,
                price: rating,
                is_anonymous: false
            };

            // Nếu đang trong chế độ sửa
            if (isEditMode && myReview) {
                const updatePayload: UpdateReviewPayload = {
                    criteria: {
                        cleanliness: rating,
                        service: rating,
                        location: rating,
                        price: rating
                    },
                    content: comment.trim()
                };
                await ReviewService.update(myReview._id, updatePayload);
                setIsEditMode(false);
                Alert.alert("Thành công", "Đã cập nhật đánh giá của bạn.");
            } else {
                await ReviewService.create(payload);
                Alert.alert("Thành công", "Cảm ơn bạn đã gửi đánh giá!");
            }
            
            // Lấy lại danh sách mới
            await fetchReviewsOnly();
            
            // Xóa form đang nhập nếu là create mới
            if (!isEditMode) {
                setRating(0);
                setComment('');
            }

        } catch (error: any) {
            console.error("Error submitting review:", error);
            Alert.alert("Thất bại", error.message || "Không thể gửi đánh giá, vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReview = () => {
        if (!myReview) return;
        // The API actually returns `{ criteria: { cleanliness, service, location, price } }` 
        // We initially set the values via rating directly and display using `myReview.rating`
        // But for editing we should ensure rating is fetched properly
        const initRating = myReview.criteria?.cleanliness || myReview.rating || 5;
        setRating(initRating);
        setComment(myReview.content);
        setIsEditMode(true);
    };

    const handleDeleteReview = () => {
        if (!myReview) return;
        Alert.alert(
            "Xóa đánh giá", 
            "Bạn có chắc chắn muốn xóa đánh giá này không?",
            [
                { text: "Bỏ qua", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsSubmitting(true);
                            await ReviewService.remove(myReview._id);
                            setMyReview(null);
                            setRating(0);
                            setComment('');
                            setIsEditMode(false);
                            await fetchReviewsOnly();
                            Alert.alert("Thành công", "Đã xóa đánh giá.");
                        } catch {
                            Alert.alert("Lỗi", "Không thể xóa đánh giá, vui lòng thử lại sau.");
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    // --- RENDER HELPERS ---
    const renderStarSelector = () => (
        <View className="flex-row gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={`star-sel-${star}`} onPress={() => setRating(star)}>
                    <StarIcon 
                        color={star <= rating ? "#F59E0B" : "#D1D5DB"} 
                        fill={star <= rating ? "#F59E0B" : "none"} 
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderReviewStars = (value: number) => (
        <View className="flex-row gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon 
                    key={`star-${star}`}
                    color={star <= value ? "#F59E0B" : "#D1D5DB"} 
                    fill={star <= value ? "#F59E0B" : "none"} 
                />
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
            if (diffDays <= 30) return `${Math.floor(diffDays/7)} tuần trước`;
            return date.toLocaleDateString('vi-VN');
        } catch {
            return '';
        }
    };

    if (isLoadingInit) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50 pb-6">
            {/* Nút Back (Top Left, Absolute hoặc Padding) */}
            <View className="flex-row items-center pt-14 pb-4 px-4 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={onBack} className="w-10 h-10 items-start justify-center">
                    <ArrowLeftIcon />
                </TouchableOpacity>
                <Text className="text-xl font-bold flex-1 text-center pr-10">Đánh giá địa điểm</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                
                {/* 1. Header Địa Điểm Card */}
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

                {/* Phần Review Card */}
                {!myReview || isEditMode ? (
                    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base font-bold text-slate-900">
                                {isEditMode ? "Sửa đánh giá của bạn" : "Đánh giá của bạn"}
                            </Text>
                            {isEditMode && (
                                <TouchableOpacity onPress={() => {
                                    setIsEditMode(false);
                                    setRating(0);
                                    setComment('');
                                }}>
                                    <Text className="text-sm font-semibold text-slate-400">HỦY</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {renderStarSelector()}
                        
                        <View className="bg-slate-100 rounded-xl px-3 py-2 mb-4 h-24">
                            <TextInput
                                className="bg-transparent text-slate-800 flex-1 text-sm outline-none"
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
                                <Text className="text-white font-bold text-base">
                                    {isEditMode ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-blue-100 bg-blue-50/20">
                        <Text className="text-base font-bold text-slate-900 mb-2">Đánh giá của bạn</Text>
                        <View className="mb-2">{renderReviewStars(myReview.criteria?.cleanliness || myReview.rating || 5)}</View>
                        <Text className="text-slate-700 text-sm mb-4">{myReview.content}</Text>
                        
                        <View className="flex-row items-center gap-x-3">
                            <TouchableOpacity onPress={handleEditReview} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl items-center shadow-sm">
                                <Text className="font-semibold text-slate-700">Sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDeleteReview} className="flex-1 py-2.5 bg-red-50 border border-red-100 rounded-xl items-center shadow-sm">
                                <Text className="font-semibold text-red-600">Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* 3. Danh sách Đánh giá gần đây */}
                <View className="bg-white rounded-2xl p-4 shadow-sm mb-8">
                    <Text className="text-base font-bold text-slate-900 mb-4">Đánh giá gần đây</Text>
                    
                    {reviews.length === 0 ? (
                        <Text className="text-slate-500 text-center py-4">Chưa có đánh giá nào.</Text>
                    ) : (
                        reviews.map((review, index) => (
                            <View 
                                key={review._id} 
                                className={`flex-row mt-4 ${index !== reviews.length - 1 ? 'border-b border-slate-100 pb-4' : ''}`}
                            >
                                {/* Avatar */}
                                <Image 
                                    source={{ uri: review.user?.avatar  || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'}}
                                    className="w-10 h-10 rounded-full mr-3 bg-slate-200"
                                />
                                
                                {/* Info */}
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-semibold mb-1">
                                        {review.user?.fullName || 'Người dùng ẩn danh'}
                                    </Text>
                                    
                                    <View className="mb-2">
                                        {renderReviewStars(review.criteria?.cleanliness || review.rating || 5)}
                                    </View>
                                    
                                    <Text className="text-slate-700 text-sm mb-2">{review.content}</Text>
                                    
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-slate-500 text-xs">{formatRelativeTime(review.created_at)}</Text>
                                        <ChevronRightIcon color="#475569" />
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>
        </View>
    );
};
