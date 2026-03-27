import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { MainTab } from './BottomTabBar';
import { Button, CardContainer, SectionHeader, StarRating, StatItemView } from './shared';

// --- IMPORT SERVICE & TYPES ---
import { PlacesService } from '../services/placeService/place.service';
import { ForumService } from '../services/forumService/forum.service';
// Import thêm PlaceCategory để filter
import { Place, PlaceCategory } from '../services/placeService/place.type';
import { ForumPost, PostSortBy } from '../services/forumService/forum.type';

const reviews = [
    {
        id: 'r1',
        author: 'Minh Anh',
        avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        content: 'Phở rất ngon nên thử',
    },
    {
        id: 'r2',
        author: 'Quang Minh',
        avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        rating: 4,
        content: 'Quán hơi đông',
    },
];

interface ExploreScreenProps {
    onViewForum?: () => void;
    activeTab: MainTab;
    onTabChange: (tab: MainTab) => void;
    onViewAllPlaces?: () => void;
    onPlaceClick: (placeId: string) => void;
}

export const ExploreScreen = ({
    onViewForum,
    activeTab,
    onTabChange,
    onViewAllPlaces,
    onPlaceClick
}: ExploreScreenProps) => {
    // State quản lý dữ liệu từ API
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
    const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
    const [isLoadingForum, setIsLoadingForum] = useState(true);

    // Lấy dữ liệu địa điểm khi màn hình load
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                setIsLoadingPlaces(true);
                // Gọi API lấy 2 nhà hàng có đánh giá cao nhất
                const response = await PlacesService.findAll({
                    limit: 2,
                    sortBy: 'rating',
                    sortOrder: 'DESC',
                    category: PlaceCategory.RESTAURANT // <-- THÊM FILTER CATEGORY Ở ĐÂY
                });

                // Set dữ liệu trả về
                if (response && response.data) {
                    setPlaces(response.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách địa điểm:', error);
            } finally {
                setIsLoadingPlaces(false);
            }
        };
        fetchPlaces();
    }, []);

    useEffect(() => {
        const fetchForumPosts = async () => {
            try {
                setIsLoadingForum(true);
                const response = await ForumService.findAll({
                    page: 1,
                    limit: 2,
                    sortBy: PostSortBy.LATEST,
                });

                setForumPosts(response.data || []);
            } catch (error) {
                console.error('Lỗi khi tải bài diễn đàn:', error);
                setForumPosts([]);
            } finally {
                setIsLoadingForum(false);
            }
        };

        fetchForumPosts();
    }, []);

    // Format số lượng đánh giá (VD: 1500 -> 1.5K)
    const formatReviewCount = (count: number) => {
        if (!count) return '0';
        return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();
    };

    // Hàm lấy mô tả vị trí (Ưu tiên khoảng cách distance, nếu không có thì lấy quận/thành phố)
    const getLocationInfo = (place: Place) => {
        if (place.distance !== undefined) {
            return `${place.distance.toFixed(1)} km`;
        }
        if (place.address) {
            const parts = place.address.split(',');
            // Lấy phần tử chứa thông tin quận hoặc rút gọn địa chỉ
            return parts.length > 2 ? parts[parts.length - 3].trim() : parts[0];
        }
        return 'Gần bạn';
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC]">
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB',
                    backgroundColor: '#F8FAFC',
                    alignItems: 'center',
                }}
            >
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#2B8EF0' }}>Khám phá</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90, paddingTop: 16 }}>

                {/* ================= KHÁM PHÁ ĐỊA ĐIỂM ================= */}
                <CardContainer style={{ marginHorizontal: 20, marginBottom: 16 }}>
                    <SectionHeader title="Khám phá nhà hàng" actionLabel="Xem tất cả" onActionPress={onViewAllPlaces} />

                    <View className="flex-row px-4 pb-4" style={{ gap: 12 }}>
                        {isLoadingPlaces ? (
                            <View className="flex-1 items-center justify-center py-6">
                                <ActivityIndicator size="small" color="#2B8EF0" />
                            </View>
                        ) : places.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-6">
                                <Text className="text-gray-500 text-sm">Chưa có nhà hàng nào</Text>
                            </View>
                        ) : (
                            places.map((place) => (
                                <Button
                                    key={place._id}
                                    activeOpacity={0.8}
                                    onPress={() => onPlaceClick(place._id)}
                                    style={{ flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F3F4F6' }}
                                >
                                    <Image
                                        source={{ uri: place.images && place.images.length > 0 ? place.images[0] : 'https://via.placeholder.com/400' }}
                                        style={{ width: '100%', height: 100 }}
                                        resizeMode="cover"
                                    />
                                    <View style={{ padding: 8 }}>
                                        <Text style={{ fontSize: 13, color: '#111827', fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
                                            {place.name}
                                        </Text>
                                        <StarRating rating={place.rating || 0} />
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
                                                    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#9CA3AF" />
                                                </Svg>
                                                <Text style={{ fontSize: 11, color: '#6B7280' }} numberOfLines={1}>
                                                    {getLocationInfo(place)}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
                                                    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                                                    <Circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" />
                                                    <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                                                </Svg>
                                                <Text style={{ fontSize: 11, color: '#6B7280' }}>
                                                    {formatReviewCount(place.reviewCount)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Button>
                            ))
                        )}
                    </View>
                </CardContainer>

                {/* ================= DIỄN ĐÀN DU LỊCH ================= */}
                <CardContainer style={{ marginHorizontal: 20, marginBottom: 16 }}>
                    <SectionHeader title="Diễn đàn du lịch" actionLabel="Xem tất cả" onActionPress={onViewForum} />

                    {isLoadingForum ? (
                        <View className="py-4 items-center justify-center">
                            <ActivityIndicator size="small" color="#2B8EF0" />
                        </View>
                    ) : forumPosts.length === 0 ? (
                        <Button
                            activeOpacity={0.75}
                            onPress={onViewForum}
                            style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                        >
                            <Text style={{ fontSize: 13, color: '#6B7280' }}>
                                Chưa có bài viết gần đây. Chạm để vào diễn đàn.
                            </Text>
                        </Button>
                    ) : (
                        forumPosts.map((post, index) => (
                            <Button
                                key={post._id}
                                activeOpacity={0.75}
                                onPress={onViewForum}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderTopWidth: index === 0 ? 1 : 0,
                                    borderBottomWidth: index < forumPosts.length - 1 ? 1 : 1,
                                    borderColor: '#F3F4F6',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <Image
                                        source={{
                                            uri:
                                                post.author?.avatar ||
                                                'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80',
                                        }}
                                        style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                    />
                                    <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600' }} numberOfLines={1}>
                                        {post.author?.fullName || 'Thành viên'}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 13, color: '#374151', fontWeight: '400', marginBottom: 8, lineHeight: 19 }} numberOfLines={2}>
                                    {post.content}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <StatItemView
                                        value={post.stats?.likes || 0}
                                        icon={(
                                            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                                <Path
                                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                                    fill="#EF4444"
                                                    stroke="#EF4444"
                                                    strokeWidth="1.5"
                                                />
                                            </Svg>
                                        )}
                                        valueStyle={{ fontSize: 13 }}
                                    />
                                    <StatItemView
                                        value={post.stats?.comments || 0}
                                        icon={(
                                            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                                <Path
                                                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                                    stroke="#9CA3AF"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </Svg>
                                        )}
                                        valueStyle={{ fontSize: 13 }}
                                    />
                                </View>
                            </Button>
                        ))
                    )}
                </CardContainer>

                {/* ================= ĐÁNH GIÁ ĐỊA ĐIỂM ================= */}
                <CardContainer style={{ marginHorizontal: 20, marginBottom: 16 }}>
                    <SectionHeader title="Đánh giá địa điểm" actionLabel="Xem tất cả" />

                    {reviews.map((review, index) => (
                        <Button
                            key={review.id}
                            activeOpacity={0.75}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderTopWidth: 1,
                                borderBottomWidth: index < reviews.length - 1 ? 1 : 0,
                                borderColor: '#F3F4F6',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Image
                                    source={{ uri: review.avatarImage }}
                                    style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                />
                                <View>
                                    <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600', marginBottom: 3 }}>{review.author}</Text>
                                    <StarRating rating={review.rating} />
                                </View>
                            </View>
                            <Text style={{ fontSize: 13, color: '#374151', fontWeight: '400', lineHeight: 19 }}>
                                {review.content}
                            </Text>
                        </Button>
                    ))}
                </CardContainer>

            </ScrollView>
        </SafeAreaView>
    );
};
