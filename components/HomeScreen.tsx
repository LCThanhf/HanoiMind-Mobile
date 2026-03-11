import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { BottomTabBar, MainTab } from './BottomTabBar';

// Trip data
const myTrips = [
    {
        id: '1',
        title: 'Hà Nội [Chill]',
        location: 'Hà Nội, Việt Nam',
        days: '3 ngày',
        tag: 'Chill',
        tagIcon: 'check',
        type: 'Solo',
        colorBox: '#C8A882',
    },
    {
        id: '2',
        title: 'Đà Lạt – Sương Mờ',
        location: 'Lâm Đồng',
        days: '4 ngày',
        tag: 'Lãng mạn',
        tagIcon: 'heart',
        type: 'Solo',
        colorBox: '#B0C4B8',
    },
];

export const HomeScreen = ({
    activeNavTab = 'home',
    onTabChange,
    onOpenProfile,
    onCreateTrip,
    onTripClick,
}: {
    activeNavTab?: MainTab;
    onTabChange?: (tab: MainTab) => void;
    onOpenProfile?: () => void;
    onCreateTrip?: () => void;
    onTripClick?: (tripId: string) => void;
}) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'group'>('personal');
    const [tabWidth, setTabWidth] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: activeTab === 'personal' ? 0 : 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(colorAnim, {
                toValue: activeTab === 'personal' ? 0 : 1,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    }, [activeTab]);

    return (
        <SafeAreaView className="flex-1 bg-[#F5F6FA]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-12 pb-4 bg-[#F5F6FA]">
                <Text className="text-[#22C55E] text-[26px] font-bold" style={{ fontWeight: '900' }}>
                    HanoiMind
                </Text>
                <View className="flex-row items-center">
                    {/* Search Icon */}
                    <TouchableOpacity className="mr-4" activeOpacity={0.7}>
                        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                                stroke="#374151"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </TouchableOpacity>
                    {/* Avatar */}
                    <TouchableOpacity onPress={onOpenProfile} activeOpacity={0.8}>
                        <View
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: '#D1D5DB',
                                overflow: 'hidden',
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Switcher */}
            <View
                className="mx-5 mb-5 rounded-xl p-1"
                style={{ backgroundColor: '#E5E7EB' }}
            >
                <View
                    className="flex-row relative"
                    style={{ height: 40 }}
                    onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / 2)}
                >
                    {/* Animated White Background */}
                    <Animated.View
                        className="absolute rounded-lg"
                        style={{
                            width: tabWidth || '50%',
                            height: '100%',
                            backgroundColor: 'white',
                            left: 0,
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, tabWidth || 0],
                                    }),
                                },
                            ],
                        }}
                    />

                    {/* Tab Buttons */}
                    <TouchableOpacity
                        className="flex-1 items-center justify-center"
                        onPress={() => setActiveTab('personal')}
                        activeOpacity={0.8}
                    >
                        <Animated.Text
                            className="text-[13px] tracking-wide"
                            style={{
                                color: colorAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['#2B8EF0', '#6B7280'],
                                }),
                                fontWeight: activeTab === 'personal' ? '600' : '500'
                            }}
                        >
                            CÁ NHÂN
                        </Animated.Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 items-center justify-center"
                        onPress={() => setActiveTab('group')}
                        activeOpacity={0.8}
                    >
                        <Animated.Text
                            className="text-[13px] tracking-wide"
                            style={{
                                color: colorAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['#6B7280', '#2B8EF0'],
                                }),
                                fontWeight: activeTab === 'group' ? '600' : '500'
                            }}
                        >
                            CÙNG NHÓM
                        </Animated.Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* My Trips Section */}
                <View className="px-5 mb-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-900 text-[16px]" style={{ fontWeight: '600' }}>
                            Chuyến đi của bạn
                        </Text>
                        <View className="bg-[#EBF5FF] px-3 py-1 rounded-full">
                            <Text className="text-[#2B8EF0] text-[13px] font-semibold">
                                {myTrips.length} Trips
                            </Text>
                        </View>
                    </View>

                    {myTrips.map((trip) => (
                        <TouchableOpacity
                            key={trip.id}
                            className="bg-white rounded-2xl mb-3 overflow-hidden"
                            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
                            onPress={() => onTripClick?.(trip.id)}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row">
                                {/* Thumbnail */}
                                <View
                                    style={{
                                        width: 110,
                                        height: 110,
                                        backgroundColor: trip.colorBox,
                                    }}
                                >
                                    {/* Solo badge */}
                                    <View
                                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: '#2B8EF0' }}
                                    >
                                        <Text className="text-white text-[10px] font-semibold">{trip.type}</Text>
                                    </View>
                                </View>

                                {/* Info */}
                                <View className="flex-1 px-4 py-3 justify-between">
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-1 pr-2">
                                            <Text className="text-gray-900 text-[15px]" style={{ fontWeight: '700' }}>
                                                {trip.title}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
                                                    <Path
                                                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                                                        fill="#9CA3AF"
                                                    />
                                                </Svg>
                                                <Text className="text-gray-500 text-[10px]">{trip.location}</Text>
                                            </View>
                                        </View>
                                        {/* Three dots */}
                                        <TouchableOpacity className="p-1" activeOpacity={0.6}>
                                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                                <Circle cx="12" cy="5" r="1.5" fill="#9CA3AF" />
                                                <Circle cx="12" cy="12" r="1.5" fill="#9CA3AF" />
                                                <Circle cx="12" cy="19" r="1.5" fill="#9CA3AF" />
                                            </Svg>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Tags row */}
                                    <View className="flex-row items-center mt-2">
                                        <View className="flex-row items-center mr-4">
                                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                                                <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#2B8EF0" strokeWidth="2" />
                                                <Path d="M16 2v4M8 2v4M3 10h18" stroke="#2B8EF0" strokeWidth="2" strokeLinecap="round" />
                                            </Svg>
                                            <Text className="text-gray-600 text-[12px]">{trip.days}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                                                {trip.tagIcon === 'heart' ? (
                                                    <Path
                                                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                                        stroke="#22C55E"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                ) : (
                                                    <G>
                                                        <Circle cx="12" cy="12" r="9" stroke="#22C55E" strokeWidth="2" />
                                                        <Path
                                                            d="M12 3L9 12h6L12 3z"
                                                            fill="#22C55E"
                                                        />
                                                        <Path
                                                            d="M12 21L15 12H9L12 21z"
                                                            fill="#22C55E"
                                                            fillOpacity="0.4"
                                                        />
                                                    </G>
                                                )}
                                            </Svg>
                                            <Text className="text-gray-600 text-[12px]">{trip.tag}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Suggestions Section */}
                <View className="px-5 mb-8">
                    <Text className="text-gray-900 text-[16px] mb-3" style={{ fontWeight: '600' }}>
                        Chuyến đi mới
                    </Text>

                    {/* AI Plan Card */}
                    <TouchableOpacity
                        className="bg-[#EBF5FF] rounded-2xl p-4 flex-row items-center"
                        activeOpacity={0.8}
                        onPress={onCreateTrip}
                        style={{ shadowColor: '#2B8EF0', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
                    >
                        {/* + Button */}
                        <View
                            className="items-center justify-center mr-4"
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                backgroundColor: '#2B8EF0',
                            }}
                        >
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 5v14M5 12h14"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </Svg>
                        </View>

                        <View className="flex-1">
                            <Text className="text-gray-900 text-[15px]" style={{ fontWeight: '700' }}>
                                Tạo kế hoạch mới
                            </Text>
                            <Text className="text-gray-500 text-[12px] mt-0.5">
                                Sử dụng AI để tối ưu lịch trình của bạn ngay!
                            </Text>
                        </View>

                        {/* Chevron */}
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M9 18l6-6-6-6"
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* Bottom padding for navigation bar */}
                <View className="h-20" />
            </ScrollView>

            <BottomTabBar
                activeTab={activeNavTab}
                onTabPress={(tab) => {
                    onTabChange?.(tab);
                    if (tab === 'profile') {
                        onOpenProfile?.();
                    }
                }}
            />
        </SafeAreaView>
    );
};

