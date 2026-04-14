import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
// Import thêm các Icon cần thiết cho nút
import { Play, MapPin, Pause, Trash2, PlayCircle } from 'lucide-react-native'; 

import { ItineraryTab } from './ItineraryTab';
import { MembersTab } from './MembersTab';
import { MoodVoteTab } from './MoodVoteTab';
import { JourneyService } from '../../../services/journeyService/journey.service';
import { JourneyStatus } from '../../../services/journeyService/journey.type';
import { TripStatCard } from './TripStatCard';
import { useTripDetailData } from './useTripDetailData';
import { JourneyInviteSharePayload } from '../../../services/chatService/journeyInvite';
import { Button, PillBadge } from '../../shared';

interface TripDetailScreenProps {
    onBack: () => void;
    tripId: string;
    onOpenProfile?: () => void;
    onViewDetail?: () => void;
    onAddPlace?: (dayNumber: number) => void;
    onSendJourneyInviteToChat?: (payload: JourneyInviteSharePayload) => void;
    onOpenTracking?: () => void;
}

export const TripDetailScreen = ({
    onBack,
    tripId,
    onOpenProfile,
    onViewDetail,
    onAddPlace,
    onSendJourneyInviteToChat,
    onOpenTracking,
}: TripDetailScreenProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'itinerary' | 'members' | 'mood'>('itinerary');
    const [tabWidth, setTabWidth] = useState(0);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(0)).current;
    const {
        isLoading,
        error,
        tripData,
        journey,
        isTrackingActionLoading,
        handleStartJourney,
        handlePauseJourney,
        handleResumeJourney,
        handleCancelJourney,
        handleCheckInStop,
        handleSkipStop,
    } = useTripDetailData(tripId);

    useEffect(() => {
        if (error) {
            Alert.alert('Không thể tải chuyến đi', 'Vui lòng thử lại sau.');
        }
    }, [error]);

    useEffect(() => {
        const targetValue = activeSubTab === 'itinerary' ? 0 : activeSubTab === 'members' ? 1 : 2;
        Animated.timing(slideAnim, {
            toValue: targetValue,
            duration: 250,
            useNativeDriver: true,
        }).start();

        Animated.timing(colorAnim, {
            toValue: targetValue,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [activeSubTab, colorAnim, slideAnim]);

    const handleLeaveJourney = async () => {
        try {
            setIsLeaving(true);
            await JourneyService.leaveJourney(tripId);
            Alert.alert('Thành công', 'Bạn đã rời khỏi chuyến đi.');
            onBack();
        } catch {
            Alert.alert('Không thể rời chuyến đi', 'Vui lòng thử lại sau.');
        } finally {
            setIsLeaving(false);
        }
    };

    const handleDeleteJourney = () => {
        if (isDeleting) return;

        Alert.alert('Xóa chuyến đi', 'Bạn có chắc chắn muốn xóa chuyến đi này? Hành động này không thể hoàn tác.', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setIsDeleting(true);
                        await JourneyService.remove(tripId);
                        Alert.alert('Thành công', 'Đã xóa chuyến đi.');
                        onBack();
                    } catch {
                        Alert.alert('Không thể xóa chuyến đi', 'Bạn không có quyền hoặc hệ thống đang gặp lỗi.');
                    } finally {
                        setIsDeleting(false);
                    }
                },
            },
        ]);
    };

    const handleMoreOptions = () => {
        Alert.alert('Tùy chọn chuyến đi', 'Chọn thao tác bạn muốn thực hiện', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: isDeleting ? 'Đang xóa...' : 'Xóa chuyến đi',
                style: 'destructive',
                onPress: handleDeleteJourney,
            },
        ]);
    };

    // ĐÃ ĐƯỢC TỐI ƯU UI LẠI TOÀN BỘ
    const renderTrackingControls = () => {
        if (!journey) return null;

        // Trạng thái chuẩn bị / sắp diễn ra
        if (journey.status === JourneyStatus.PLANNING || journey.status === JourneyStatus.UPCOMING || journey.status === null) {
            return (
                <View className="px-5 mb-5 mt-2">
                    <Button
                        onPress={handleStartJourney}
                        disabled={isTrackingActionLoading}
                        className="flex-row items-center justify-center rounded-2xl py-4"
                        style={{ 
                            backgroundColor: '#3B82F6',
                            shadowColor: '#3B82F6',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 5
                        }}
                    >
                        <Play size={20} color="#fff" fill="#fff" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-[16px]">Bắt đầu chuyến đi</Text>
                    </Button>
                </View>
            );
        }

        // Trạng thái Đang diễn ra
        if (journey.status === JourneyStatus.ON_GOING) {
            return (
                <View className="px-5 mb-6 mt-2">
                    {/* Nút Xem lộ trình - Đổ bóng, bo tròn mềm mại */}
                    <Button
                        onPress={onOpenTracking}
                        className="flex-row items-center justify-center rounded-2xl py-4 mb-3"
                        style={{ 
                            backgroundColor: '#10B981', // Màu xanh lá nổi bật, an toàn
                            shadowColor: '#10B981',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 5
                        }}
                    >
                        <MapPin size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-[16px]">Xem lộ trình & Điểm danh</Text>
                    </Button>

                    {/* Hàng nút phụ - Dùng nền nhạt (Soft-Tinted) thay vì nền khối cứng */}
                    <View className="flex-row gap-3">
                        <Button
                            onPress={handlePauseJourney}
                            disabled={isTrackingActionLoading}
                            className="flex-row items-center justify-center rounded-xl py-3.5 flex-1"
                            style={{ backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#F59E0B' }}
                        >
                            <Pause size={18} color="#D97706" style={{ marginRight: 6 }} fill="#D97706" />
                            <Text style={{ color: '#D97706', fontWeight: '700', fontSize: 15 }}>Tạm dừng</Text>
                        </Button>

                        <Button
                            onPress={() =>
                                Alert.alert(
                                    'Hủy chuyến đi',
                                    'Bạn có chắc chắn muốn hủy chuyến đi này?',
                                    [
                                        { text: 'Không', style: 'cancel' },
                                        {
                                            text: 'Hủy',
                                            style: 'destructive',
                                            onPress: handleCancelJourney,
                                        },
                                    ]
                                )
                            }
                            disabled={isTrackingActionLoading}
                            className="flex-row items-center justify-center rounded-xl py-3.5 flex-1"
                            style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444' }}
                        >
                            <Trash2 size={18} color="#DC2626" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 15 }}>Hủy chuyến</Text>
                        </Button>
                    </View>
                </View>
            );
        }

        // Trạng thái Tạm dừng
        if (journey.status === JourneyStatus.PAUSED) {
            return (
                <View className="px-5 mb-5 mt-2">
                    <Button
                        onPress={() => {
                            const today = new Date().toISOString().split('T')[0];
                            handleResumeJourney(today);
                        }}
                        disabled={isTrackingActionLoading}
                        className="flex-row items-center justify-center rounded-2xl py-4"
                        style={{ 
                            backgroundColor: '#3B82F6',
                            shadowColor: '#3B82F6',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 5
                        }}
                    >
                        <PlayCircle size={22} color="#fff" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-[16px]">Tiếp tục chuyến đi</Text>
                    </Button>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            {/* Header */}
            <View className="px-5 pt-2 pb-4 bg-white">
                <View className="flex-row items-center justify-between relative">
                    {/* Left Side */}
                    <Button onPress={onBack} activeOpacity={0.7}>
                        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M19 12H5M12 19l-7-7 7-7"
                                stroke="#111827"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </Button>

                    {/* Center Title */}
                    <Text className="text-[17px] text-gray-900" style={{ fontWeight: '600' }}>
                        Chi tiết chuyến đi
                    </Text>

                    {/* Right Side */}
                    <View className="flex-row items-center">
                        <Button className="mr-3" activeOpacity={0.7}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
                                    stroke="#111827"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        </Button>
                        <Button activeOpacity={0.7} onPress={handleMoreOptions} disabled={isDeleting}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Circle cx="12" cy="5" r="1.5" fill="#111827" />
                                <Circle cx="12" cy="12" r="1.5" fill="#111827" />
                                <Circle cx="12" cy="19" r="1.5" fill="#111827" />
                            </Svg>
                        </Button>
                    </View>
                </View>
            </View>

            {/* Divider Line */}
            <View className="h-px bg-gray-200" />

            {isLoading || !tripData ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2B8EF0" />
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Status Tabs */}
                    <View className="px-5 flex-row items-center mb-4 mt-4">
                        <PillBadge
                            label={tripData.status}
                            backgroundColor="#ECFDF5"
                            textColor="#22C55E"
                            textWeight="600"
                            containerStyle={{ marginRight: 8 }}
                        />
                        <PillBadge label="Owner" backgroundColor="#EBF5FF" textColor="#2B8EF0" textWeight="600" />
                    </View>

                    {/* Trip Title & Location */}
                    <View className="px-5 mb-4">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-[20px] text-gray-900 flex-1 mr-3" style={{ fontWeight: '700' }}>
                                {tripData.title}
                            </Text>
                            {onViewDetail ? (
                                <Button
                                    onPress={onViewDetail}
                                    activeOpacity={0.8}
                                    className="px-3 py-1.5 rounded-full"
                                    style={{ backgroundColor: '#EBF5FF' }}
                                >
                                    <Text className="text-[12px]" style={{ color: '#2B8EF0', fontWeight: '700' }}>
                                        Xem chi tiết
                                    </Text>
                                </Button>
                            ) : null}
                        </View>
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
                        <View className="mr-2 flex-1">
                            <TripStatCard
                                icon={
                                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                        <Path
                                            d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                                            stroke="#22C55E"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                }
                                label="Ngân sách"
                                value={tripData.budget}
                                iconBgColor="#ECFDF5"
                            />
                        </View>
                        <View className="ml-2 flex-1">
                            <TripStatCard
                                icon={
                                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                        <Path
                                            d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                                            stroke="#F97316"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                }
                                label="Thời gian"
                                value={tripData.days}
                                iconBgColor="#FEF3E2"
                            />
                        </View>
                    </View>

                    {/* Sub Navigation Tabs */}
                    <View className="px-5 mb-5">
                        <View
                            className="rounded-xl p-1"
                            style={{ backgroundColor: '#E5E7EB' }}
                        >
                            <View
                                className="flex-row relative"
                                style={{ height: 40 }}
                                onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / 3)}
                            >
                                {/* Animated White Background */}
                                <Animated.View
                                    className="absolute rounded-lg"
                                    style={{
                                        width: tabWidth || '33.33%',
                                        height: '100%',
                                        backgroundColor: 'white',
                                        left: 0,
                                        transform: [
                                            {
                                                translateX: slideAnim.interpolate({
                                                    inputRange: [0, 1, 2],
                                                    outputRange: [0, tabWidth || 0, (tabWidth || 0) * 2],
                                                }),
                                            },
                                        ],
                                    }}
                                />

                                {/* Tab Buttons */}
                                <Button
                                    className="flex-1 items-center justify-center"
                                    onPress={() => setActiveSubTab('itinerary')}
                                    activeOpacity={0.8}
                                >
                                    <Animated.Text
                                        className="text-[13px]"
                                        style={{
                                            color: colorAnim.interpolate({
                                                inputRange: [0, 1, 2],
                                                outputRange: ['#2B8EF0', '#6B7280', '#6B7280'],
                                            }),
                                            fontWeight: activeSubTab === 'itinerary' ? '600' : '500'
                                        }}
                                    >
                                        Lịch trình
                                    </Animated.Text>
                                </Button>
                                <Button
                                    className="flex-1 items-center justify-center"
                                    onPress={() => setActiveSubTab('members')}
                                    activeOpacity={0.8}
                                >
                                    <Animated.Text
                                        className="text-[13px]"
                                        style={{
                                            color: colorAnim.interpolate({
                                                inputRange: [0, 1, 2],
                                                outputRange: ['#6B7280', '#2B8EF0', '#6B7280'],
                                            }),
                                            fontWeight: activeSubTab === 'members' ? '600' : '500'
                                        }}
                                    >
                                        Thành viên
                                    </Animated.Text>
                                </Button>
                                <Button
                                    className="flex-1 items-center justify-center"
                                    onPress={() => setActiveSubTab('mood')}
                                    activeOpacity={0.8}
                                >
                                    <Animated.Text
                                        className="text-[13px]"
                                        style={{
                                            color: colorAnim.interpolate({
                                                inputRange: [0, 1, 2],
                                                outputRange: ['#6B7280', '#6B7280', '#2B8EF0'],
                                            }),
                                            fontWeight: activeSubTab === 'mood' ? '600' : '500'
                                        }}
                                    >
                                        Mood Vote
                                    </Animated.Text>
                                </Button>
                            </View>
                        </View>
                    </View>

                    {/* Tracking Controls */}
                    {renderTrackingControls()}

                    {activeSubTab === 'itinerary' && (
                        <ItineraryTab
                            itinerary={tripData.itinerary}
                            onAddPlace={(dayNumber: number) => onAddPlace?.(dayNumber)}
                            journeyStatus={journey?.status}
                            onCheckIn={handleCheckInStop}
                            onSkip={handleSkipStop}
                            isCheckingIn={isTrackingActionLoading}
                        />
                    )}

                    {activeSubTab === 'members' && (
                        <MembersTab
                            members={tripData.members}
                            inviteCode={tripData.inviteCode}
                            journeyId={tripId}
                            journeyName={tripData.title}
                            onLeaveTrip={handleLeaveJourney}
                            onSendInviteToChat={onSendJourneyInviteToChat}
                            isLeaving={isLeaving}
                        />
                    )}
                    {activeSubTab === 'mood' && (
                        <MoodVoteTab
                            options={tripData.moodVotes}
                            membersCount={tripData.members.length}
                            tripName={tripData.title}
                            tripId={tripId}
                            moodVoteEntries={tripData.moodVoteEntries || []}
                        />
                    )}

                    {/* Bottom padding */}
                    <View className="h-24" />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};