import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DayItinerary } from './types';

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

interface ItineraryTabProps {
    itinerary: DayItinerary[];
}

export const ItineraryTab = ({ itinerary }: ItineraryTabProps) => {
    if (!itinerary.length) {
        return (
            <View className="px-5 pb-6">
                <View
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' }}
                >
                    <Text className="text-[14px] text-gray-700" style={{ fontWeight: '600' }}>
                        Chưa có lịch trình chi tiết.
                    </Text>
                    <Text className="text-[13px] text-gray-500 mt-1" style={{ fontWeight: '400' }}>
                        Hãy thêm địa điểm để bắt đầu lên kế hoạch cho chuyến đi.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <>
            {itinerary.map((dayData, dayIndex) => (
                <View key={`${dayData.day}-${dayData.date || dayIndex}`} className="px-5 mb-6">
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

                    {dayData.activities.map((activity, activityIndex) => (
                        <View key={activity.id} className="flex-row mb-4">
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

                    {!dayData.activities.length ? (
                        <View
                            style={{
                                backgroundColor: '#F9FAFB',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                            }}
                        >
                            <Text style={{ fontSize: 13, color: '#4B5563', fontWeight: '500' }}>
                                Nghỉ ngơi, tự do tham quan
                            </Text>
                        </View>
                    ) : null}
                </View>
            ))}
        </>
    );
};
