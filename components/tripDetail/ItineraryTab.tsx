import React from 'react';
import { View, Text } from 'react-native';
import { DayItinerary } from './types';
import { CardContainer, SectionHeader } from '../shared';

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
    onAddPlace?: (dayNumber: number) => void;
}

export const ItineraryTab = ({ itinerary, onAddPlace }: ItineraryTabProps) => {
    if (!itinerary.length) {
        return (
            <View className="px-5 pb-6">
                <CardContainer className="p-5" style={{ backgroundColor: '#F8FAFC' }}>
                    <Text className="text-[14px] text-gray-700" style={{ fontWeight: '600' }}>
                        Chưa có lịch trình chi tiết.
                    </Text>
                    <Text className="text-[13px] text-gray-500 mt-1" style={{ fontWeight: '400' }}>
                        Hãy thêm địa điểm để bắt đầu lên kế hoạch cho chuyến đi.
                    </Text>
                </CardContainer>
            </View>
        );
    }

    return (
        <>
            {itinerary.map((dayData, dayIndex) => (
                <View key={`${dayData.day}-${dayData.date || dayIndex}`} className="px-5 mb-6">
                    <SectionHeader
                        title={`Ngày ${dayData.day}: ${dayData.title}`}
                        actionLabel="Thêm địa điểm"
                        onActionPress={() => onAddPlace?.(dayData.day)}
                        showActionIcon={false}
                        actionColor="#2B8EF0"
                        showAccent={false}
                        paddingHorizontal={0}
                        paddingTop={0}
                        paddingBottom={0}
                        marginBottom={16}
                    />

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
                        <CardContainer
                            style={{
                                backgroundColor: '#F8FAFC',
                                borderColor: '#E5E7EB',
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                            }}
                        >
                            <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }}>
                                Nghỉ ngơi, tự do di chuyển
                            </Text>
                        </CardContainer>
                    ) : null}
                </View>
            ))}
        </>
    );
};

