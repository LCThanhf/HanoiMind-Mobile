import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { ItineraryTab } from './tripDetail/ItineraryTab';
import { MembersTab } from './tripDetail/MembersTab';
import { MoodVoteTab } from './tripDetail/MoodVoteTab';
import { JourneyService } from '../services/journeyService/journey.service';
import { TripStatCard } from './tripDetail/TripStatCard';
import { useTripDetailData } from './tripDetail/useTripDetailData';

interface TripDetailScreenProps {
    onBack: () => void;
    tripId: string;
    onOpenProfile?: () => void;
    onViewDetail?: () => void;
}

export const TripDetailScreen = ({ onBack, tripId, onOpenProfile, onViewDetail }: TripDetailScreenProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'itinerary' | 'members' | 'mood'>('itinerary');
    const [tabWidth, setTabWidth] = useState(0);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(0)).current;
    const { isLoading, error, tripData } = useTripDetailData(tripId);

    useEffect(() => {
        if (error) {
            Alert.alert('Khong the tai chuyen di', 'Vui long thu lai sau.');
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

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
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
                        Chi tiết chuyến đi
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
                        <TouchableOpacity activeOpacity={0.7} onPress={handleMoreOptions} disabled={isDeleting}>
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

            {isLoading || !tripData ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2B8EF0" />
                </View>
            ) : (
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
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-[20px] text-gray-900 flex-1 mr-3" style={{ fontWeight: '700' }}>
                                {tripData.title}
                            </Text>
                            <TouchableOpacity
                                onPress={onViewDetail}
                                activeOpacity={0.8}
                                className="px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: '#EBF5FF' }}
                            >
                                <Text className="text-[12px]" style={{ color: '#2B8EF0', fontWeight: '700' }}>
                                    Xem chi tiết
                                </Text>
                            </TouchableOpacity>
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
                                <TouchableOpacity
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
                                </TouchableOpacity>
                                <TouchableOpacity
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
                                </TouchableOpacity>
                                <TouchableOpacity
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
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {activeSubTab === 'itinerary' && <ItineraryTab itinerary={tripData.itinerary} />}

                    {activeSubTab === 'members' && (
                        <MembersTab
                            members={tripData.members}
                            inviteCode={tripData.inviteCode}
                            onLeaveTrip={handleLeaveJourney}
                            isLeaving={isLeaving}
                        />
                    )}
                    {activeSubTab === 'mood' && (
                        <MoodVoteTab
                            options={tripData.moodVotes}
                            membersCount={tripData.members.length}
                            tripName={tripData.title}
                        />
                    )}

                    {/* Bottom padding */}
                    <View className="h-24" />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};
