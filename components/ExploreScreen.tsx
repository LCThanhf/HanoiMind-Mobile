import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Image } from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { BottomTabBar, MainTab } from './BottomTabBar';

const places = [
    {
        id: 'p1',
        name: 'Phở bò Hà Nội',
        rating: 4.7,
        distance: '2 km',
        reviews: '18K',
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 'p2',
        name: 'Bún chả Hàng Mành',
        rating: 4.8,
        distance: '1,2 km',
        reviews: '36K',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
    },
];

const forumPosts = [
    {
        id: 'f1',
        author: 'Minh Anh',
        avatarColor: '#C4856A',
        avatarInitial: 'M',
        avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        content: 'Ai có gợi ý quán bún chả ngon ở Hà Nội k?',
        likes: 36,
        comments: 5,
    },
    {
        id: 'f2',
        author: 'Quang Minh',
        avatarColor: '#5C4033',
        avatarInitial: 'Q',
        avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        content: 'Chia sẻ lịch trình Sapa 2 ngày cho mọi người',
        likes: 18,
        comments: 10,
    },
];

const reviews = [
    {
        id: 'r1',
        author: 'Minh Anh',
        avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        rating: 1,
        content: 'Phở rất ngon nên thử',
    },
    {
        id: 'r2',
        author: 'Quang Minh',
        avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        rating: 1,
        content: 'Quán hơi đông - 1star',
    },
];

const StarRating = ({ rating, total = 5 }: { rating: number; total?: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
            <Svg key={i} width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 1 }}>
                <Polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill={i < Math.floor(rating) ? '#FBBF24' : '#E5E7EB'}
                    stroke={i < Math.floor(rating) ? '#FBBF24' : '#E5E7EB'}
                    strokeWidth="1"
                />
            </Svg>
        ))}
        <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600', marginLeft: 4 }}>{rating}</Text>
    </View>
);

interface ExploreScreenProps {
    activeTab: MainTab;
    onTabChange: (tab: MainTab) => void;
}

export const ExploreScreen = ({ activeTab, onTabChange }: ExploreScreenProps) => {
    const [searchText, setSearchText] = useState('');

    return (
        <SafeAreaView className="flex-1 bg-[#F5F6FA]">
            {/* Header */}
            <View className="px-5 pt-12 pb-4 bg-[#F5F6FA]">
                <Text className="text-gray-900 text-[22px] text-center" style={{ fontWeight: '700' }}>
                    Khám phá
                </Text>
            </View>

            {/* Search Bar */}
            <View className="px-5 mb-4">
                <View
                    className="flex-row items-center px-4 rounded-2xl"
                    style={{
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        height: 46,
                    }}
                >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
                        <Path
                            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <TextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Tìm địa điểm..."
                        placeholderTextColor="#9CA3AF"
                        style={{ flex: 1, fontSize: 14, color: '#111827' }}
                    />
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>

                {/* Khám phá địa điểm */}
                <View
                    className="mx-5 mb-4 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#F3F4F6' }}
                >
                    {/* Section Header */}
                    <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                        <Text className="text-gray-900 text-[15px]" style={{ fontWeight: '700' }}>
                            Khám phá địa điểm
                        </Text>
                        <TouchableOpacity activeOpacity={0.7} className="flex-row items-center">
                            <Text style={{ fontSize: 13, color: '#2B8EF0', fontWeight: '500' }}>Xem tất cả</Text>
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
                                <Path d="M9 18l6-6-6-6" stroke="#2B8EF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    </View>

                    {/* Place Cards Grid */}
                    <View className="flex-row px-4 pb-4" style={{ gap: 12 }}>
                        {places.map((place) => (
                            <TouchableOpacity
                                key={place.id}
                                activeOpacity={0.8}
                                style={{ flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' }}
                            >
                                <Image
                                    source={{ uri: place.image }}
                                    style={{ width: '100%', height: 100 }}
                                    resizeMode="cover"
                                />
                                <View style={{ padding: 8 }}>
                                    <Text style={{ fontSize: 13, color: '#111827', fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
                                        {place.name}
                                    </Text>
                                    <StarRating rating={place.rating} />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
                                                <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#9CA3AF" />
                                            </Svg>
                                            <Text style={{ fontSize: 11, color: '#6B7280' }}>{place.distance}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
                                                <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                                                <Circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" />
                                                <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                                            </Svg>
                                            <Text style={{ fontSize: 11, color: '#6B7280' }}>{place.reviews}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Diễn đàn du lịch */}
                <View
                    className="mx-5 mb-4 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#F3F4F6' }}
                >
                    {/* Section Header */}
                    <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                        <Text className="text-gray-900 text-[15px]" style={{ fontWeight: '700' }}>
                            Diễn đàn du lịch
                        </Text>
                        <TouchableOpacity activeOpacity={0.7} className="flex-row items-center">
                            <Text style={{ fontSize: 13, color: '#2B8EF0', fontWeight: '500' }}>Xem tất cả</Text>
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
                                <Path d="M9 18l6-6-6-6" stroke="#2B8EF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    </View>

                    {/* Forum Posts */}
                    {forumPosts.map((post, index) => (
                        <TouchableOpacity
                            key={post.id}
                            activeOpacity={0.75}
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
                                    source={{ uri: post.avatarImage }}
                                    style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                />
                                <Text style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}>{post.author}</Text>
                            </View>
                            <Text style={{ fontSize: 13, color: '#374151', fontWeight: '400', marginBottom: 8, lineHeight: 19 }}>
                                {post.content}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 5 }}>
                                        <Path
                                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                            fill="#EF4444"
                                            stroke="#EF4444"
                                            strokeWidth="1.5"
                                        />
                                    </Svg>
                                    <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>{post.likes}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 5 }}>
                                        <Path
                                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                            stroke="#9CA3AF"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                    <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>{post.comments}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Đánh giá địa điểm */}
                <View
                    className="mx-5 mb-4 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#F3F4F6' }}
                >
                    {/* Section Header */}
                    <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                        <Text className="text-gray-900 text-[15px]" style={{ fontWeight: '700' }}>
                            Đánh giá địa điểm
                        </Text>
                        <TouchableOpacity activeOpacity={0.7} className="flex-row items-center">
                            <Text style={{ fontSize: 13, color: '#2B8EF0', fontWeight: '500' }}>Xem tất cả</Text>
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
                                <Path d="M9 18l6-6-6-6" stroke="#2B8EF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    </View>

                    {/* Reviews */}
                    {reviews.map((review, index) => (
                        <TouchableOpacity
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
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            <BottomTabBar activeTab={activeTab} onTabPress={onTabChange} />
        </SafeAreaView>
    );
};
