import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Image,
} from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { BottomTabBar, MainTab } from './BottomTabBar';

const allPlaces = [
    {
        id: 'p1',
        name: 'Bún chả Hàng Mành',
        rating: 4.8,
        distance: '1,2 km',
        reviews: '36K',
        tags: ['#street_food', '#local'],
        category: 'Nhà Hàng',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 'p2',
        name: 'Phở bò Hà Nội',
        rating: 4.7,
        distance: '2 km',
        reviews: '18K',
        tags: ['#street_food', '#local'],
        category: 'Nhà Hàng',
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 'p3',
        name: "Pizza 4P'S",
        rating: 4.6,
        distance: '1,4 km',
        reviews: '67K',
        tags: ['#restaurant'],
        category: 'Nhà Hàng',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 'p4',
        name: 'Cafe trứng Giàng',
        rating: 4.6,
        distance: '800 m',
        reviews: '18K',
        tags: ['#cafe', '#chill'],
        category: 'Cafe',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 'p5',
        name: 'Cà phê Nhân',
        rating: 4.5,
        distance: '1,1 km',
        reviews: '12K',
        tags: ['#cafe', '#local'],
        category: 'Cafe',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 'p6',
        name: 'Công viên Thống Nhất',
        rating: 4.4,
        distance: '3 km',
        reviews: '9K',
        tags: ['#park', '#chill'],
        category: 'Công viên',
        image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=400&q=80',
    },
];

const categories = ['Tất cả', 'Nhà Hàng', 'Cafe', 'Công viên'];

const OutlineStarRating = ({ rating, total = 5 }: { rating: number; total?: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
            <Svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 2 }}>
                <Polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill={i < Math.floor(rating) ? '#FCD34D' : 'none'}
                    stroke="#FBBF24"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </Svg>
        ))}
        <Text style={{ fontSize: 13, color: '#F59E0B', fontWeight: '700', marginLeft: 4 }}>{rating}</Text>
    </View>
);

interface PlacesExploreScreenProps {
    onBack: () => void;
    activeTab: MainTab;
    onTabChange: (tab: MainTab) => void;
}

export const PlacesExploreScreen = ({ onBack, activeTab, onTabChange }: PlacesExploreScreenProps) => {
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const filteredPlaces = allPlaces.filter((place) => {
        const matchCategory = activeCategory === 'Tất cả' || place.category === activeCategory;
        const matchSearch = place.name.toLowerCase().includes(searchText.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: 48,
                    paddingBottom: 14,
                    backgroundColor: '#F5F6FA',
                }}
            >
                <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M19 12H5M12 19l-7-7 7-7"
                            stroke="#111827"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </TouchableOpacity>
                <Text
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '700',
                        color: '#111827',
                        marginRight: 36,
                    }}
                >
                    Khám phá địa điểm
                </Text>
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        borderRadius: 14,
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

            {/* Category Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 2 }}
                style={{ flexGrow: 0, marginBottom: 10 }}
            >
                {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveCategory(cat)}
                            activeOpacity={0.75}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 7,
                                borderRadius: 20,
                                backgroundColor: isActive ? '#2B8EF0' : 'white',
                                borderWidth: 1,
                                borderColor: isActive ? '#2B8EF0' : '#E5E7EB',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: isActive ? '700' : '500',
                                    color: isActive ? 'white' : '#6B7280',
                                }}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Sort Row */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingBottom: 10,
                }}
            >
                <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>Sắp xếp: </Text>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                    <Polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill="#FBBF24"
                        stroke="#FBBF24"
                        strokeWidth="1"
                    />
                </Svg>
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}>Rating</Text>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 4 }}>
                    <Path
                        d="M8 10l4-4 4 4M8 14l4 4 4-4"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </View>

            {/* Places List */}
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 10 }}
            >
                {filteredPlaces.map((place) => (
                    <TouchableOpacity
                        key={place.id}
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row',
                            backgroundColor: 'white',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: '#F3F4F6',
                            padding: 10,
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        {/* Image */}
                        <Image
                            source={{ uri: place.image }}
                            style={{ width: 140, height: 110, borderRadius: 10 }}
                            resizeMode="cover"
                        />

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            {/* Name */}
                            <Text
                                style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 }}
                                numberOfLines={1}
                            >
                                {place.name}
                            </Text>

                            {/* Stars */}
                            <OutlineStarRating rating={place.rating} />

                            {/* Tags */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                                {place.tags.map((tag) => (
                                    <View
                                        key={tag}
                                        style={{
                                            backgroundColor: '#EBF5FF',
                                            borderRadius: 20,
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                        }}
                                    >
                                        <Text style={{ fontSize: 11, color: '#2B8EF0', fontWeight: '600' }}>{tag}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Distance & Reviews */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
                                        <Path
                                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                                            fill="#9CA3AF"
                                        />
                                    </Svg>
                                    <Text style={{ fontSize: 11, color: '#6B7280' }}>{place.distance}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
                                        <Path
                                            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                                            stroke="#9CA3AF"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <Circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" />
                                        <Path
                                            d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                                            stroke="#9CA3AF"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </Svg>
                                    <Text style={{ fontSize: 11, color: '#6B7280' }}>{place.reviews}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {filteredPlaces.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 48 }}>
                        <Text style={{ fontSize: 15, color: '#9CA3AF', fontWeight: '500' }}>Không tìm thấy địa điểm</Text>
                    </View>
                )}
            </ScrollView>

            <BottomTabBar activeTab={activeTab} onTabPress={onTabChange} />
        </SafeAreaView>
    );
};
