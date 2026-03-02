import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Heart Icon Component
const HeartIcon = ({ filled, size = 24 }: { filled: boolean; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke={filled ? '#EF4444' : '#D1D5DB'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={filled ? '#EF4444' : 'none'}
        />
    </Svg>
);

// Data mocks
const categories = [
    { id: '1', title: 'Công viên', icon: '🌲' },
    { id: '2', title: 'Nhà hàng', icon: '🍽️' },
    { id: '3', title: 'Điểm đến', icon: '🏖️' },
    { id: '4', title: 'Khách sạn', icon: '🏨' },
    { id: '5', title: 'Quán bar', icon: '🍸' },
];

const suggestedDestinations = [
    {
        id: '1',
        title: 'Mount Bromo',
        subtitle: 'Volcano in East Java',
        rating: '4.9',
        distance: '1.5km',
        colorBox: '#B3C6E5', // Placeholder color instead of image
    },
    {
        id: '2',
        title: 'Labengki Sombori',
        subtitle: 'Islands in Sulawesi',
        rating: '4.8',
        distance: '3.0km',
        colorBox: '#79C9B1',
    },
    {
        id: '3',
        title: 'Sailing Komodo',
        subtitle: 'Labuan Bajo',
        rating: '4.8',
        distance: '20km',
        colorBox: '#76A3D6',
    },
];

const suggestedHotels = [
    {
        id: '1',
        title: 'Swiss-Belhotel Rainforest Kuta',
        subtitle: 'Jl. Sunset Road No. 101, Kuta, Bali, Indonesia',
        rating: '4-star hotel',
        colorBox: '#828E84',
    },
    {
        id: '2',
        title: 'Swiss-Belhotel Rainforest Kuta',
        subtitle: 'Jl. Sunset Road No. 101, Kuta, Bali, Indonesia',
        rating: '4-star hotel',
        colorBox: '#D6CDBA',
    },
    {
        id: '3',
        title: 'Swiss-Belhotel Rainforest Kuta',
        subtitle: 'Jl. Sunset Road No. 101, Kuta, Bali, Indonesia',
        rating: '4-star hotel',
        colorBox: '#A89E90',
    },
];

const highlyRatedPlaces = [
    {
        id: '1',
        title: 'Mount Bromo',
        subtitle: 'Volcano in East Java',
        rating: '4.9',
        distance: '1.5km',
        colorBox: '#D4A574',
    },
    {
        id: '2',
        title: 'Raja Ampat',
        subtitle: 'Paradise in West Papua',
        rating: '4.9',
        distance: '2.1km',
        colorBox: '#5FA3D0',
    },
    {
        id: '3',
        title: 'Borobudur Temple',
        subtitle: 'Ancient temple in Central Java',
        rating: '4.8',
        distance: '5.2km',
        colorBox: '#8B7355',
    },
];

export const HomeScreen = ({ onLogout }: { onLogout?: () => void }) => {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });
    };

    return (
        <View className="flex-1 bg-[#F3F4F6]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>

                {/* Header Section with curved teal background */}
                <View className="pt-14 pb-20 px-5 bg-[#0F7376] rounded-b-[40px] relative z-0">

                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            {/* Profile Avatar Placeholder - Clickable for logout */}
                            <TouchableOpacity onPress={onLogout}>
                                <View className="w-12 h-12 rounded-full bg-orange-200 border-2 border-white mr-3 overflow-hidden" />
                            </TouchableOpacity>
                            <Text className="text-white text-2xl font-bold">Hi, Username</Text>
                        </View>

                        {/* Notification Bell */}
                        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center">
                            <Text className="text-xl">🔔</Text>
                            {/* Notification Badge */}
                            <View className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="bg-white rounded-xl flex-row items-center px-4 py-3 shadow-md">
                        <Text className="text-gray-400 mr-2 text-lg">🔍</Text>
                        <TextInput
                            placeholder="Bạn muốn đi đâu?"
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 text-base p-0"
                        />
                    </View>
                </View>

                {/* Floating Weather Card */}
                <View className="px-5 -mt-12 relative z-10 mb-8">
                    <View className="bg-white rounded-2xl p-5 shadow-lg flex-row justify-between items-center elevation-5">
                        <View>
                            <View className="flex-row items-baseline mb-1">
                                <Text className="text-5xl font-bold text-[#2A4D3B]">36</Text>
                                <Text className="text-2xl font-bold text-[#2A4D3B]">°C</Text>
                            </View>
                            <Text className="text-gray-600 font-medium mb-3">Trời nắng</Text>
                            <Text className="text-[#3A7659] font-medium text-xs">Thích hợp để ra ngoài</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-600 mb-2 font-medium">Độ ẩm: --</Text>
                            <Text className="text-gray-600 mb-2 font-medium">Sức gió: --</Text>
                            <Text className="text-[#3A7659] font-medium text-xs mt-3 bg-green-50 px-2 py-1 rounded-md">Some stat i dunno --</Text>
                        </View>
                    </View>
                </View>

                {/* Categories Row */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="px-5 mb-8"
                >
                    {categories.map((category) => (
                        <TouchableOpacity key={category.id} className="items-center mr-6">
                            <View className="w-14 h-14 bg-teal-50 rounded-full items-center justify-center mb-2">
                                <Text className="text-2xl">{category.icon}</Text>
                            </View>
                            <Text className="text-xs text-gray-700 font-medium text-center w-16">{category.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Suggested Destinations */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center px-5 mb-4">
                        <Text className="text-lg font-bold text-gray-700">Điểm tham quan gợi ý cho bạn</Text>
                        <TouchableOpacity>
                            <Text className="text-[#0F7376] font-medium">See all</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="px-5"
                    >
                        {suggestedDestinations.map((item) => (
                            <View key={item.id} className="w-[160px] bg-white rounded-2xl mr-4 shadow-sm pb-3 overflow-hidden">
                                <View
                                    className="w-full h-[120px]"
                                    style={{ backgroundColor: item.colorBox }}
                                />
                                <View className="p-3">
                                    <Text className="font-bold text-sm text-[#2A4D3B] mb-0.5" numberOfLines={1}>{item.title}</Text>
                                    <Text className="text-[8px] text-gray-500 mb-2" numberOfLines={1}>{item.subtitle}</Text>

                                    <View className="flex-row items-center mb-3">
                                        <Text className="text-yellow-400 text-xs mr-1">★</Text>
                                        <Text className="text-xs text-gray-600">{item.rating}</Text>
                                    </View>

                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <Text className="text-[8px] text-gray-400">Cách bạn</Text>
                                            <Text className="text-xs font-semibold text-gray-700">{item.distance}</Text>
                                        </View>
                                        <TouchableOpacity className="bg-[#3A7659] px-3 py-1.5 rounded-full">
                                            <Text className="text-white text-xs font-medium">Chi tiết</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Suggested Hotels */}
                <View className="px-5 mb-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-700">Khách sạn gợi ý cho bạn</Text>
                        <TouchableOpacity>
                            <Text className="text-[#0F7376] font-medium">See all</Text>
                        </TouchableOpacity>
                    </View>

                    {suggestedHotels.map((hotel) => (
                        <View key={hotel.id} className="bg-white rounded-2xl p-3 mb-4 shadow-sm flex-row items-center">
                            <View
                                className="w-[100px] h-[100px] rounded-xl mr-3"
                                style={{ backgroundColor: hotel.colorBox }}
                            />
                            <View className="flex-1">
                                <View className="flex-row justify-between items-start">
                                    <Text className="font-bold text-sm text-[#2A4D3B] mb-1 flex-1 pr-2" numberOfLines={2}>{hotel.title}</Text>
                                    <TouchableOpacity 
                                        onPress={() => toggleFavorite(hotel.id)}
                                        className="w-8 h-8 items-center justify-center"
                                        activeOpacity={0.6}
                                    >
                                        <HeartIcon filled={favorites.has(hotel.id)} size={22} />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-[8px] text-gray-500 mb-2 mt-1" numberOfLines={1}>{hotel.subtitle}</Text>

                                <View className="flex-row items-center mb-2">
                                    <Text className="text-yellow-400 text-xs mr-1">★</Text>
                                    <Text className="text-xs text-gray-600">{hotel.rating}</Text>
                                </View>

                                <View className="items-end mt-1">
                                    <TouchableOpacity className="bg-[#3A7659] px-4 py-1.5 rounded-full">
                                        <Text className="text-white text-xs font-medium">Chi tiết</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Highly Rated Places Section */}
                <View className="mb-10">
                    <View className="flex-row justify-between items-center px-5 mb-4">
                        <Text className="text-lg font-bold text-gray-800">Những địa điểm được đánh giá cao</Text>
                        <TouchableOpacity>
                            <Text className="text-[#0F7376] font-medium">See all</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="px-5"
                    >
                        {highlyRatedPlaces.map((item) => (
                            <View key={item.id} className="w-[160px] bg-white rounded-2xl mr-4 shadow-sm pb-3 overflow-hidden">
                                <View
                                    className="w-full h-[120px]"
                                    style={{ backgroundColor: item.colorBox }}
                                />
                                <View className="p-3">
                                    <Text className="font-bold text-sm text-[#2A4D3B] mb-0.5" numberOfLines={1}>{item.title}</Text>
                                    <Text className="text-[8px] text-gray-500 mb-2" numberOfLines={1}>{item.subtitle}</Text>

                                    <View className="flex-row items-center mb-3">
                                        <Text className="text-yellow-400 text-xs mr-1">★</Text>
                                        <Text className="text-xs text-gray-600">{item.rating}</Text>
                                    </View>

                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <Text className="text-[8px] text-gray-400">Cách bạn</Text>
                                            <Text className="text-xs font-semibold text-gray-700">{item.distance}</Text>
                                        </View>
                                        <TouchableOpacity className="bg-[#3A7659] px-3 py-1.5 rounded-full">
                                            <Text className="text-white text-xs font-medium">Chi tiết</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

            </ScrollView>
        </View>
    );
};
