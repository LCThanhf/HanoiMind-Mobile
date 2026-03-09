import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface TripDetailScreenProps {
    onBack: () => void;
    tripId: string;
}

// Timeline icon components
const TimelineDot = () => (
    <View
        style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#2B8EF0',
            borderWidth: 2,
            borderColor: '#EBF5FF',
        }}
    />
);

export const TripDetailScreen = ({ onBack, tripId }: TripDetailScreenProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'itinerary' | 'members' | 'mood'>('itinerary');
    const [activeNavTab] = useState<'home' | 'trips' | 'explore' | 'profile'>('trips');

    // Trip data based on tripId
    const tripData = tripId === '1' ? {
        title: 'Hà Nội [Chill]',
        location: 'Hà Nội, Việt Nam',
        budget: '8.5 Tr',
        days: '3 Ngày',
        status: 'Chuyến đã sắp tới',
        itinerary: [
            {
                day: 1,
                title: 'Khám phá Phố Cổ',
                activities: [
                    {
                        time: '09:00',
                        title: 'Điểm hẹn Hồ Hoàn Kiếm',
                        description: 'Tập trung tại khu vực Hồ Hoàn Kiếm, tản bộ quanh hồ và khám phá đền Ngọc Sơn.',
                    },
                    {
                        time: '12:00',
                        title: 'Ăn trưa tại Phố Cổ',
                        description: 'Thưởng thức các món ăn đặc sản Hà Nội như phở, bún chả tại khu phố cổ.',
                    },
                    {
                        time: '15:00',
                        title: 'Cafe hopping',
                        description: 'Ghé thăm các quán cafe đẹp và thưởng thức cà phê trứng, cà phê sữa đá.',
                    },
                    {
                        time: '19:00',
                        title: 'Chợ đêm Đồng Xuân',
                        description: 'Khám phá chợ đêm, mua sắm và thưởng thức ẩm thực đường phố.',
                    },
                ],
            },
        ],
    } : {
        title: 'Mùa Hè Tại Đà Lạt',
        location: 'Lâm Đồng, Việt Nam',
        budget: '12.5 Tr',
        days: '4 Ngày',
        status: 'Chuyến đã sắp tới',
        itinerary: [
            {
                day: 1,
                title: 'Khám phá Trung Tâm Thành Phố',
                activities: [
                    {
                        time: '08:00',
                        title: 'Sân bay Liên Khương',
                        description: 'Hạ cánh tại sân bay Liên Khương và di chuyển về trung tâm Đà Lạt.',
                    },
                    {
                        time: '11:00',
                        title: 'Check-in khách sạn',
                        description: 'Nhận phòng và nghỉ ngơi trước khi bắt đầu hành trình khám phá.',
                    },
                    {
                        time: '14:00',
                        title: 'Hồ Xuân Hương & Chợ Đà Lạt',
                        description: 'Đạp xe quanh hồ Xuân Hương và mua sắm tại chợ Đà Lạt.',
                    },
                    {
                        time: '19:00',
                        title: 'Ẩm thực địa phương',
                        description: 'Thưởng thức món lẩu gà lá é, bánh tráng nướng và các món ăn đặc sản.',
                    },
                ],
            },
        ],
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-5 pt-12 pb-4 bg-white">
                <View className="flex-row items-center justify-between relative">
                    {/* Left Side */}
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

                    {/* Center Title */}
                    <Text className="text-[17px] text-gray-900" style={{ fontWeight: '600' }}>
                        Chuyến đi
                    </Text>

                    {/* Right Side */}
                    <View className="flex-row items-center">
                        <TouchableOpacity className="mr-3" activeOpacity={0.7}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
                                    stroke="#111827"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Circle cx="12" cy="5" r="1.5" fill="#111827" />
                                <Circle cx="12" cy="12" r="1.5" fill="#111827" />
                                <Circle cx="12" cy="19" r="1.5" fill="#111827" />
                            </Svg>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Divider Line */}
            <View className="h-px bg-gray-200" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Status Tabs */}
                <View className="px-5 flex-row items-center mb-4 mt-4">
                    <View
                        className="px-3 py-1.5 rounded-full mr-2"
                        style={{ backgroundColor: '#ECFDF5' }}
                    >
                        <Text className="text-[12px]" style={{ color: '#22C55E', fontWeight: '600' }}>
                            {tripData.status}
                        </Text>
                    </View>
                    <View
                        className="px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: '#EBF5FF' }}
                    >
                        <Text className="text-[12px]" style={{ color: '#2B8EF0', fontWeight: '600' }}>
                            Owner
                        </Text>
                    </View>
                </View>

                {/* Trip Title & Location */}
                <View className="px-5 mb-4">
                    <Text className="text-[20px] text-gray-900 mb-2" style={{ fontWeight: '700' }}>
                        {tripData.title}
                    </Text>
                    <View className="flex-row items-center">
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                stroke="#6B7280"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <Circle cx="12" cy="10" r="3" stroke="#6B7280" strokeWidth="2" />
                        </Svg>
                        <Text className="text-[13px] text-gray-600 ml-1.5" style={{ fontWeight: '500' }}>
                            {tripData.location}
                        </Text>
                    </View>
                </View>

                {/* Budget & Days Cards */}
                <View className="px-5 flex-row mb-5">
                    <View
                        className="flex-1 mr-2 p-4 rounded-2xl"
                        style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' }}
                    >
                        <View
                            className="items-center justify-center mb-2"
                            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5' }}
                        >
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                                    stroke="#22C55E"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        </View>
                        <Text className="text-[12px] text-gray-600 mb-1" style={{ fontWeight: '500' }}>
                            Ngân sách
                        </Text>
                        <Text className="text-[18px] text-gray-900" style={{ fontWeight: '700' }}>
                            {tripData.budget}
                        </Text>
                    </View>

                    <View
                        className="flex-1 ml-2 p-4 rounded-2xl"
                        style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' }}
                    >
                        <View
                            className="items-center justify-center mb-2"
                            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEF3E2' }}
                        >
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                                    stroke="#F97316"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        </View>
                        <Text className="text-[12px] text-gray-600 mb-1" style={{ fontWeight: '500' }}>
                            Thời gian
                        </Text>
                        <Text className="text-[18px] text-gray-900" style={{ fontWeight: '700' }}>
                            {tripData.days}
                        </Text>
                    </View>
                </View>

                {/* Sub Navigation Tabs */}
                <View className="px-5 mb-4 flex-row">
                    <TouchableOpacity
                        className="mr-6"
                        onPress={() => setActiveSubTab('itinerary')}
                        activeOpacity={0.7}
                    >
                        <Text
                            className="text-[15px] pb-2"
                            style={{
                                fontWeight: activeSubTab === 'itinerary' ? '600' : '500',
                                color: activeSubTab === 'itinerary' ? '#111827' : '#6B7280',
                                borderBottomWidth: activeSubTab === 'itinerary' ? 2 : 0,
                                borderBottomColor: '#2B8EF0',
                            }}
                        >
                            Lịch trình
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="mr-6"
                        onPress={() => setActiveSubTab('members')}
                        activeOpacity={0.7}
                    >
                        <Text
                            className="text-[15px] pb-2"
                            style={{
                                fontWeight: activeSubTab === 'members' ? '600' : '500',
                                color: activeSubTab === 'members' ? '#111827' : '#6B7280',
                                borderBottomWidth: activeSubTab === 'members' ? 2 : 0,
                                borderBottomColor: '#2B8EF0',
                            }}
                        >
                            Thành viên
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveSubTab('mood')}
                        activeOpacity={0.7}
                    >
                        <Text
                            className="text-[15px] pb-2"
                            style={{
                                fontWeight: activeSubTab === 'mood' ? '600' : '500',
                                color: activeSubTab === 'mood' ? '#111827' : '#6B7280',
                                borderBottomWidth: activeSubTab === 'mood' ? 2 : 0,
                                borderBottomColor: '#2B8EF0',
                            }}
                        >
                            Mood Vote
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View className="h-px bg-gray-200 mb-5" />

                {/* Itinerary Timeline */}
                {activeSubTab === 'itinerary' && tripData.itinerary.map((dayData, dayIndex) => (
                    <View key={dayIndex} className="px-5 mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-[15px] text-gray-900 flex-1 mr-3" style={{ fontWeight: '700' }}>
                                Ngày {dayData.day}: {dayData.title}
                            </Text>
                            <TouchableOpacity activeOpacity={0.7} style={{ flexShrink: 0 }}>
                                <Text className="text-[12px]" style={{ color: '#2B8EF0', fontWeight: '600' }}>
                                    Thêm địa điểm
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Timeline Items */}
                        {dayData.activities.map((activity, activityIndex) => (
                            <View key={activityIndex} className="flex-row mb-4">
                                {/* Timeline */}
                                <View className="items-center mr-4" style={{ width: 12 }}>
                                    <TimelineDot />
                                    {activityIndex < dayData.activities.length - 1 && (
                                        <View
                                            style={{
                                                width: 2,
                                                flex: 1,
                                                backgroundColor: '#E5E7EB',
                                                marginVertical: 4,
                                            }}
                                        />
                                    )}
                                </View>

                                {/* Content */}
                                <View className="flex-1">
                                    <Text className="text-[12px] mb-2" style={{ color: '#2B8EF0', fontWeight: '600' }}>
                                        {activity.time}
                                    </Text>
                                    <Text className="text-[15px] text-gray-900 mb-1" style={{ fontWeight: '600' }}>
                                        {activity.title}
                                    </Text>
                                    <Text className="text-[13px] text-gray-600 leading-5" style={{ fontWeight: '400' }}>
                                        {activity.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Bottom padding */}
                <View className="h-24" />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                className="absolute bottom-24 right-5 items-center justify-center"
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: '#2B8EF0',
                    shadowColor: '#2B8EF0',
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 8,
                }}
                activeOpacity={0.85}
            >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M12 5v14M5 12h14"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                </Svg>
            </TouchableOpacity>

            {/* Bottom Navigation Bar */}
            <View 
                className="absolute bottom-0 left-0 right-0 bg-white flex-row items-center justify-around"
                style={{
                    height: 70,
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    paddingBottom: 8,
                }}
            >
                {/* Trang chủ */}
                <TouchableOpacity 
                    className="flex-1 items-center justify-center"
                    activeOpacity={0.7}
                    onPress={onBack}
                >
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Circle 
                            cx="12" 
                            cy="12" 
                            r="4" 
                            stroke="#9CA3AF"
                            strokeWidth="2"
                        />
                        <Path
                            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <Text 
                        className="text-[11px] mt-1" 
                        style={{ 
                            fontWeight: '500',
                            color: '#6B7280'
                        }}
                    >
                        Trang chủ
                    </Text>
                </TouchableOpacity>

                {/* Chuyến đi - Active */}
                <TouchableOpacity 
                    className="flex-1 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                            stroke="#2B8EF0"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Circle cx="12" cy="10" r="3" stroke="#2B8EF0" strokeWidth="2" />
                    </Svg>
                    <Text 
                        className="text-[11px] mt-1" 
                        style={{ 
                            fontWeight: '600',
                            color: '#2B8EF0'
                        }}
                    >
                        Chuyến đi
                    </Text>
                </TouchableOpacity>

                {/* Khám phá */}
                <TouchableOpacity 
                    className="flex-1 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <Text 
                        className="text-[11px] mt-1" 
                        style={{ 
                            fontWeight: '500',
                            color: '#6B7280'
                        }}
                    >
                        Khám phá
                    </Text>
                </TouchableOpacity>

                {/* Cá nhân */}
                <TouchableOpacity 
                    className="flex-1 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Circle 
                            cx="12" 
                            cy="7" 
                            r="4" 
                            stroke="#9CA3AF"
                            strokeWidth="2"
                        />
                    </Svg>
                    <Text 
                        className="text-[11px] mt-1" 
                        style={{ 
                            fontWeight: '500',
                            color: '#6B7280'
                        }}
                    >
                        Cá nhân
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
