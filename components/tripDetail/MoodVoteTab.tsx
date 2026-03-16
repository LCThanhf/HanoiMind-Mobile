import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { MoodVoteOption } from './types';

const StarSparkleIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="#F59E0B"
            stroke="#F59E0B"
            strokeLinejoin="round"
        />
    </Svg>
);

interface MoodVoteTabProps {
    options: MoodVoteOption[];
    membersCount: number;
    tripName: string;
}

const moodIconById: Record<string, JSX.Element> = {
    relax: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22C12 22 20 18 20 10C20 2 12 2 12 2C12 2 4 2 4 10C4 18 12 22 12 22Z" fill="#BEF264" />
            <Path d="M12 22V10M12 14C10 12 8 13 8 13" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
    ),
    foodie: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M4 12C4 16 7 20 12 20C17 20 20 16 20 12H4Z" fill="#F43F5E" />
            <Path d="M2 12H22M8 4H16M10 8H14" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 3V7M12 2V6M16 3V7" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
        </Svg>
    ),
    nature: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22V15" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <Path d="M12 15L8 20M12 15L16 20M12 3C8 3 5 6 5 10C5 13 7.5 15 12 15C16.5 15 19 13 19 10C19 6 16 3 12 3Z" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" strokeLinejoin="round" />
        </Svg>
    ),
    culture: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M4 22H20M4 18V10M20 18V10M8 18V14M16 18V14M12 18V14M12 2L2 10H22L12 2Z" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2" strokeLinejoin="round" />
        </Svg>
    ),
    chill: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M21 3L14 10M14 10L10 14M14 10L18 14M14 10L10 6M3 21L10 14M21 8V3H16M3 5L5 7M6 2L8 4M19 19L17 17M22 18L20 16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 16L12 12M18 12L20 10M16 12L18 14" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
        </Svg>
    ),
};

export const MoodVoteTab = ({ options, membersCount, tripName }: MoodVoteTabProps) => {
    const [selectedMood, setSelectedMood] = useState<string>(options[0]?.id || '');

    const moods = options.map((option) => ({
        ...option,
        icon: moodIconById[option.id] || moodIconById.chill,
    }));

    return (
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <StarSparkleIcon />
                    <Text className="text-[15px] text-gray-900 ml-2" style={{ fontWeight: '700' }}>
                        Lựa chọn của bạn
                    </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' }}>
                    <Text className="text-[12px] text-gray-600" style={{ fontWeight: '500' }}>
                        {tripName}
                    </Text>
                </View>
            </View>

            {/* List */}
            <View style={{ gap: 12 }}>
                {moods.map((mood) => {
                    const isActive = selectedMood === mood.id;
                    return (
                        <TouchableOpacity
                            key={mood.id}
                            onPress={() => setSelectedMood(mood.id)}
                            activeOpacity={0.8}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 16,
                                paddingVertical: 18,
                                borderRadius: 16,
                                backgroundColor: isActive ? '#EBF5FF' : '#FFFFFF',
                                borderWidth: 1.5,
                                borderColor: isActive ? '#2B8EF0' : '#F3F4F6',
                            }}
                        >
                            {/* Icon Circle */}
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: isActive ? '#2B8EF0' : '#F3F4F6',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14,
                                }}
                            >
                                {mood.icon}
                            </View>

                            {/* Text Content */}
                            <View style={{ flex: 1, paddingRight: 10 }}>
                                <Text
                                    className="text-[15px] text-gray-900 mb-1"
                                    style={{ fontWeight: '700' }}
                                >
                                    {mood.title} ({mood.votes})
                                </Text>
                                <Text
                                    className="text-[13px] text-gray-600"
                                    style={{ fontWeight: '400', lineHeight: 18 }}
                                >
                                    {mood.desc}
                                </Text>
                            </View>

                            {/* Checkmark */}
                            {isActive && (
                                <View
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: '#EBF5FF',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                        <Circle cx="12" cy="12" r="11" fill="#2B8EF0" stroke="white" strokeWidth="2" />
                                        <Path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                activeOpacity={0.8}
                style={{
                    backgroundColor: '#1ECAFA',
                    borderRadius: 14,
                    height: 52,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 24,
                    marginBottom: 16,
                    shadowColor: '#1ECAFA',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                }}
            >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Gửi bình chọn</Text>
            </TouchableOpacity>

            {/* Bottom Text */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="1.5" />
                    <Path d="M12 16v-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                    <Path d="M12 8h.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                </Svg>
                <Text className="text-[12px]" style={{ color: '#9CA3AF', fontWeight: '400' }}>
                    Dữ liệu bình chọn được đồng bộ từ thông tin chuyến đi
                </Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-200 mt-8 mb-6" />

            {/* Vote Results Header */}
            <View className="flex-row items-center justify-between mb-5">
                <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                    Kết quả bình chọn
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'white', zIndex: 3 }} />
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' }} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'white', marginLeft: -8, zIndex: 2 }} />
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' }} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'white', marginLeft: -8, zIndex: 1 }} />
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: 'white', marginLeft: -8, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#374151' }}>+2</Text>
                    </View>
                </View>
            </View>

            {/* Chart Card */}
            <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 20 }}>
                <View style={{ padding: 16, paddingBottom: 32 }}>
                    <Text style={{ fontSize: 13, color: '#4B5563', fontWeight: '500', marginBottom: 24 }}>
                        Phân bổ xu hướng chuyến đi
                    </Text>

                    {/* Donut Chart */}
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Svg width={140} height={140} viewBox="0 0 120 120">
                            <Circle
                                cx="60"
                                cy="60"
                                r="44"
                                fill="none"
                                stroke="#111827"
                                strokeWidth="16"
                                strokeDasharray="140 10 80 10 26.46 10"
                                transform="rotate(-90 60 60)"
                            />
                        </Svg>
                    </View>
                </View>

                {/* Card Footer */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                            <Path d="M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v2" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
                            <Circle cx="9" cy="7" r="4" stroke="#4B5563" strokeWidth="1.5" />
                            <Circle cx="17" cy="7" r="3" stroke="#4B5563" strokeWidth="1.5" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }}>
                            {membersCount} thành viên
                        </Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text style={{ fontSize: 13, color: '#2B8EF0', fontWeight: '600' }}>
                            Xem chi tiết
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Re-generate route button */}
            <TouchableOpacity
                activeOpacity={0.7}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 52,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: '#F59E0B',
                    backgroundColor: 'white',
                    marginBottom: 16,
                }}
            >
                <StarSparkleIcon />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#F59E0B', marginLeft: 8 }}>
                    Tạo lại lộ trình theo số đông
                </Text>
            </TouchableOpacity>

            {/* Footer Text */}
            <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '400', textAlign: 'center', fontStyle: 'italic', lineHeight: 18, paddingHorizontal: 10 }}>
                * Hành động này sẽ thay đổi hoạt động hàng ngày nhưng vẫn giữ nguyên ngân sách và số ngày đi.
            </Text>
        </ScrollView>
    );
};
