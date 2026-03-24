import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    ActivityIndicator, Alert, Linking, Share, LayoutAnimation, Platform
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PlacesService } from '../services/placeService/place.service';
import { Place } from '../services/placeService/place.type';
import { FavoriteService } from '../services/favoriteService/favorite.service';
import { FavoriteType } from '../services/favoriteService/favorite.type';
import { ReviewService } from '../services/reviewService/review.service';

// --- CẤU HÌNH GIÁ DỰA TRÊN BACKEND ---
const COST_RATES = {
    dining: { RESTAURANT: 150000, CAFE: 70000, STREET_FOOD: 40000 },
    activities: { SIGHTSEEING: 150000, HIKING: 200000, TOUR: 500000, ADVENTURE: 800000, WELLNESS: 250000, DEFAULT: 100000 }
};

const getPriceMultiplier = (level: number) => {
    const multipliers: Record<number, number> = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0 };
    return multipliers[level] || 1.0;
};

// --- ICONS ---
const MapPinIcon = ({ color = "#6B7280" }) => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </Svg>
);

const StarIcon = ({ color = "#475569" }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
);

// Icon Chat mới thêm
const MessageCircleIcon = ({ color = "#3B82F6" }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Svg>
);

export const PlaceDetailScreen = ({ onBack, onReview, placeId, refreshKey = 0 }: { onBack: () => void; onReview?: () => void; placeId: string; refreshKey?: number }) => {
    const [place, setPlace] = useState<Place | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAllHours, setShowAllHours] = useState(false);

    const fetchPlaceDetail = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const [response, reviewsRes, myFavs] = await Promise.all([
                PlacesService.findOne(placeId),
                ReviewService.findAllByPlace(placeId, { limit: 100, sort_order: 'DESC' }),
                FavoriteService.getMyFavorites(FavoriteType.PLACE).catch(() => []),
            ]);
            const data = (response as any).data || response;

            // Tính lại rating và reviewCount từ danh sách reviews thực tế
            const fetchedReviews = reviewsRes.data || [];
            const totalReviews = reviewsRes.meta?.total || fetchedReviews.length;
            let avgRating = data.rating;
            if (fetchedReviews.length > 0) {
                const totalScore = fetchedReviews.reduce((sum: number, r: any) =>
                    sum + (r.criteria?.cleanliness || r.rating || 0), 0);
                avgRating = Number((totalScore / fetchedReviews.length).toFixed(1));
            }

            setPlace({ ...data, rating: avgRating, reviewCount: totalReviews });
            setIsFavorite(myFavs.some((fav: any) => (fav.target_id === placeId || fav._id === placeId)));
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin địa điểm.');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    // refreshKey thay đổi khi quay lại từ ReviewScreen → fetch lại dữ liệu mới
    useEffect(() => {
        if (refreshKey === 0) {
            fetchPlaceDetail(true);
        } else {
            fetchPlaceDetail(false); // Không hiện loading spinner khi refresh
        }
    }, [placeId, refreshKey]);

    const handleToggleFavorite = async () => {
        try {
            const previousState = isFavorite;
            setIsFavorite(!previousState); // Optimistic Update

            const result = await FavoriteService.toggle({
                target_id: placeId,
                type: FavoriteType.PLACE
            });
            setIsFavorite(result.status === 'LIKED');
        } catch (error) {
            setIsFavorite(isFavorite);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích.');
        }
    };

    const handleShare = async () => {
        if (!place) return;
        try {
            await Share.share({
                message: `Khám phá ${place.name} trên BeroTravel!\nĐịa chỉ: ${place.address}`,
                url: place.website || '',
            });
        } catch (error) { console.log(error); }
    };

    const getEstimatedPrice = () => {
        if (!place) return '0';
        if (place.estimated_cost_vnd && place.estimated_cost_vnd > 0) return `${(place.estimated_cost_vnd / 1000).toLocaleString()}k`;
        if (place.priceLevel === 0) return 'Miễn phí';

        const cat = place.category as string;
        let basePrice = (COST_RATES.activities as any)[cat] || COST_RATES.activities.DEFAULT;
        if (['RESTAURANT', 'CAFE', 'STREET_FOOD'].includes(cat)) {
            basePrice = (COST_RATES.dining as any)[cat] || 100000;
        }

        const estimated = basePrice * getPriceMultiplier(place.priceLevel || 1);
        return `~${(estimated / 1000).toLocaleString()}k`;
    };

    const renderCrowdLevel = (level: number = 1) => {
        const percentage = (level / 5) * 100;
        let colorClass = "bg-green-500";
        let label = "Thưa thớt";
        if (level >= 4) { colorClass = "bg-red-500"; label = "Đông đúc"; }
        else if (level >= 3) { colorClass = "bg-orange-400"; label = "Vừa phải"; }

        return (
            <View className="w-full">
                <View className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                    <View className={`h-full ${colorClass} rounded-full`} style={{ width: `${percentage}%` }} />
                </View>
                <Text className="text-[8px] text-slate-400 font-bold uppercase text-center">{label}</Text>
            </View>
        );
    };

    const toggleHours = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAllHours(!showAllHours);
    };

    if (isLoading) return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color="#3B82F6" /></View>;
    if (!place) return null;

    // Biến phụ để kiểm tra có thông tin liên hệ nào không
    const hasContactInfo = place.phoneNumber || place.website || place.ownerId || (place as any).owner_id;

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header Nổi */}
            <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-4 pt-12 pb-4">
                <TouchableOpacity onPress={onBack} className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2.5"><Path d="M15 18l-6-6 6-6" /></Svg>
                </TouchableOpacity>
                <View className="flex-row gap-x-2">
                    {/* Nút Chia sẻ */}
                    <TouchableOpacity onPress={handleShare} className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2"><Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></Svg>
                    </TouchableOpacity>
                    {/* Nút Yêu thích */}
                    <TouchableOpacity onPress={handleToggleFavorite} className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill={isFavorite ? "#EF4444" : "none"} stroke={isFavorite ? "#EF4444" : "#1F2937"} strokeWidth="2">
                            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
                        </Svg>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Ảnh Bìa */}
                <View className="relative h-[380px]">
                    <Image source={{ uri: place.images?.[0] || 'https://via.placeholder.com/800' }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute bottom-6 left-5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/20">
                        <Text className="text-white text-xs font-semibold uppercase">{place.category}</Text>
                    </View>
                </View>

                {/* Nội dung chính */}
                <View className="bg-white rounded-t-[32px] -mt-8 px-5 pt-8 pb-40 shadow-2xl">

                    {/* Tên địa điểm & Số sao Đánh giá */}
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1 pr-4">
                            <Text className="text-2xl font-bold text-slate-900 leading-tight mb-2">{place.name}</Text>
                            <View className="flex-row items-center">
                                <MapPinIcon color="#3B82F6" />
                                <Text className="text-slate-500 text-sm ml-1 flex-1" numberOfLines={2}>{place.address}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <View className="bg-blue-600 px-3 py-1.5 rounded-xl flex-row items-center shadow-sm shadow-blue-200">
                                <Text className="text-white font-bold text-lg">{place.rating || 'N/A'}</Text>
                            </View>
                            <Text className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold">{place.reviewCount || 0} Đánh giá</Text>
                        </View>
                    </View>

                    {/* Quick Stats: Trạng thái, Mức giá, Độ đông */}
                    <View className="flex-row justify-between bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100 items-center">
                        <View className="items-center border-r border-slate-200 pr-3 flex-1">
                            <Text className="text-[9px] text-slate-400 uppercase font-bold mb-1">Trạng thái</Text>
                            <Text className="text-sm font-bold text-green-600">Đang mở</Text>
                        </View>
                        <View className="items-center px-3 flex-1">
                            <Text className="text-[9px] text-slate-400 uppercase font-bold mb-1">Mức giá</Text>
                            <Text className="text-sm font-bold text-slate-900">{getEstimatedPrice()}</Text>
                        </View>
                        <View className="items-center pl-3 border-l border-slate-200 flex-[1.5]">
                            <Text className="text-[9px] text-slate-400 uppercase font-bold mb-2">Độ đông</Text>
                            {renderCrowdLevel(place.crowdLevel)}
                        </View>
                    </View>

                    {/* Giới thiệu */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-2">Giới thiệu</Text>
                        <Text className="text-slate-600 leading-relaxed text-base">{place.description}</Text>
                    </View>

                    {/* Thông tin liên hệ */}
                    {hasContactInfo && (
                        <View className="mb-8 bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50">

                            {/* Nút Nhắn tin (Chỉ hiện khi có ownerId) */}
                            {(place.ownerId || (place as any).owner_id) && (
                                <TouchableOpacity
                                    onPress={() => Alert.alert("Nhắn tin", "Tính năng chat với chủ cơ sở đang được phát triển!")}
                                    className="flex-row items-center mb-4"
                                >
                                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                                        <MessageCircleIcon />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-semibold">Chat với chủ cơ sở</Text>
                                    </View>
                                    <Text className="text-blue-600 text-xs font-bold uppercase">Nhắn tin</Text>
                                </TouchableOpacity>
                            )}

                            {/* Nút Gọi điện */}
                            {place.phoneNumber && (
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(`tel:${place.phoneNumber}`)}
                                    className={`flex-row items-center ${place.website ? 'mb-4' : ''}`}
                                >
                                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Svg>
                                    </View>
                                    <Text className="text-slate-900 font-semibold flex-1">{place.phoneNumber}</Text>
                                    <Text className="text-blue-600 text-xs font-bold uppercase">Gọi điện</Text>
                                </TouchableOpacity>
                            )}

                            {/* Nút Website */}
                            {place.website && (
                                <TouchableOpacity onPress={() => Linking.openURL(place.website || '')} className="flex-row items-center">
                                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Svg>
                                    </View>
                                    <Text className="text-slate-900 font-semibold flex-1" numberOfLines={1}>{place.website.replace('https://', '')}</Text>
                                    <Text className="text-blue-600 text-xs font-bold uppercase">Website</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Giờ mở cửa */}
                    <View className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-6">
                        <TouchableOpacity onPress={toggleHours} className="flex-row justify-between items-center">
                            <Text className="text-base font-bold text-slate-900">Giờ hoạt động</Text>
                            <Text className="text-blue-600 text-xs font-bold">{showAllHours ? "THU GỌN" : "XEM TẤT CẢ"}</Text>
                        </TouchableOpacity>
                        {!showAllHours ? (
                            <Text className="text-slate-600 text-sm mt-2">Hôm nay: {place.openingHours?.weekday_text?.[0]?.split(': ')[1] || '09:00 - 19:00'}</Text>
                        ) : (
                            <View className="mt-3">
                                {place.openingHours?.weekday_text?.map((day, index) => (
                                    <View key={index} className="flex-row justify-between py-1.5 border-b border-slate-200/50">
                                        <Text className="text-slate-600 text-sm capitalize">{day.split(': ')[0]}</Text>
                                        <Text className="text-slate-900 text-sm font-medium">{day.split(': ')[1]}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-slate-100 p-4 pb-8 flex-row items-center gap-x-3 shadow-lg">
                <View className="flex-1 pr-2">
                    <Text className="text-slate-400 text-[9px] font-bold uppercase">Ngân sách dự kiến</Text>
                    <Text className="text-lg font-black text-slate-900">{getEstimatedPrice()}<Text className="text-xs font-normal text-slate-400"> /người</Text></Text>
                </View>
                <TouchableOpacity onPress={onReview} className="flex-1 bg-slate-100 h-14 rounded-2xl items-center justify-center flex-row">
                    <StarIcon />
                    <Text className="text-slate-600 font-bold ml-2">Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        const [lng, lat] = place.location.coordinates;
                        const url = Platform.select({ ios: `maps:0,0?q=${place.name}@${lat},${lng}`, android: `geo:0,0?q=${lat},${lng}(${place.name})` });
                        Linking.openURL(url || "");
                    }}
                    className="flex-[1.2] bg-blue-600 h-14 rounded-2xl items-center justify-center flex-row shadow-md"
                >
                    <Text className="text-white font-bold mr-2 text-sm">Chỉ đường</Text>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><Path d="M5 12h14M12 5l7 7-7 7" /></Svg>
                </TouchableOpacity>
            </View>
        </View>
    );
};