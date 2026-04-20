import React, { memo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { DayItinerary } from './types';
import { CardContainer, SectionHeader, Button } from '../../shared';
import { StopStatus, JourneyStatus } from '../../../services/journeyService/journey.type';

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const TimelineDot = ({ checked, status }: { checked?: boolean; status?: string }) => {
    const isArrived = status === StopStatus.ARRIVED;
    const isPending = status === StopStatus.PENDING;

    return (
        <View
            style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: isArrived ? '#10B981' : isPending ? '#FBBF24' : '#2B8EF0',
                borderWidth: 2,
                borderColor: isArrived ? '#ECFDF5' : isPending ? '#FEF3E2' : '#EBF5FF',
            }}
        />
    );
};

interface ItineraryTabProps {
    itinerary: DayItinerary[];
    onAddPlace?: (dayNumber: number) => void;
    journeyStatus?: string;
    onCheckIn?: (dayId: string, stopId: string, imageUrl?: string) => Promise<void>;
    onSkip?: (dayId: string, stopId: string) => Promise<void>;
    isCheckingIn?: boolean;
}

export const ItineraryTab = memo(({
    itinerary,
    onAddPlace,
    journeyStatus,
    onCheckIn,
    onSkip,
    isCheckingIn,
}: ItineraryTabProps) => {
    const [checkingInId, setCheckingInId] = useState<string | null>(null);

    const isOngoing = journeyStatus === JourneyStatus.ON_GOING;

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
                        title={`${dayData.title}${dayData.date ? ` (${formatDate(dayData.date)})` : ''}`}
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
                        <View key={activity.id}>
                            <View className="flex-row mb-4">
                                {/* Timeline */}
                                <View className="items-center mr-4" style={{ width: 12 }}>
                                    <TimelineDot checked={activity.status === StopStatus.ARRIVED} status={activity.status} />
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

                                    {/* Status Badge */}
                                    {activity.status === StopStatus.ARRIVED && (
                                        <View className="mt-2 px-3 py-1.5 rounded-lg self-start" style={{ backgroundColor: '#ECFDF5' }}>
                                            <Text className="text-[11px]" style={{ color: '#10B981', fontWeight: '600' }}>
                                                Đã check-in địa điểm
                                            </Text>
                                        </View>
                                    )}

                                    {activity.status === StopStatus.SKIPPED && (
                                        <View className="mt-2 px-3 py-1.5 rounded-lg self-start" style={{ backgroundColor: '#F3F4F6' }}>
                                            <Text className="text-[11px]" style={{ color: '#6B7280', fontWeight: '600' }}>
                                                Đã bỏ qua địa điểm
                                            </Text>
                                        </View>
                                    )}

                                    {/* Check-in Controls */}
                                    {isOngoing && activity.status === StopStatus.PENDING && onCheckIn && onSkip && (
                                        <View className="flex-row mt-3 gap-2">
                                            <Button
                                                onPress={async () => {
                                                    setCheckingInId(activity.id);
                                                    try {
                                                        await onCheckIn(dayData.dayId || String(dayData.day), activity.stopId || '', '');
                                                    } finally {
                                                        setCheckingInId(null);
                                                    }
                                                }}
                                                disabled={isCheckingIn || checkingInId !== null}
                                                className="items-center rounded-lg py-2 flex-1"
                                                style={{ backgroundColor: '#10B981' }}
                                            >
                                                {checkingInId === activity.id && isCheckingIn ? (
                                                    <ActivityIndicator size="small" color="white" />
                                                ) : (
                                                    <Text className="text-white font-bold text-[13px]">Check-in</Text>
                                                )}
                                            </Button>
                                            <Button
                                                onPress={async () => {
                                                    setCheckingInId(activity.id);
                                                    try {
                                                        await onSkip(dayData.dayId || String(dayData.day), activity.stopId || '');
                                                    } finally {
                                                        setCheckingInId(null);
                                                    }
                                                }}
                                                disabled={isCheckingIn || checkingInId !== null}
                                                className="items-center rounded-lg py-2 flex-1"
                                                style={{ backgroundColor: '#F3F4F6' }}
                                            >
                                                <Text className="text-gray-600 font-bold text-[13px]">Bỏ qua</Text>
                                            </Button>
                                        </View>
                                    )}
                                </View>
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
});
