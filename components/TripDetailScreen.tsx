import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { TripData } from './tripDetail/types';
import { ItineraryTab } from './tripDetail/ItineraryTab';
import { MembersTab } from './tripDetail/MembersTab';
import { MoodVoteTab } from './tripDetail/MoodVoteTab';
import { Journey, JourneyMemberRole, JourneyTag } from '../services/journeyService/journey.type';
import { JourneyService } from '../services/journeyService/journey.service';
import { PlacesService } from '../services/placeService/place.service';
import { UsersService } from '../services/userService/user.service';

const roleLabelMap: Record<string, string> = {
    [JourneyMemberRole.HOST]: 'Host',
    [JourneyMemberRole.MEMBER]: 'Member',
    [JourneyMemberRole.VIEWER]: 'Viewer',
};

const moodLabelMap: Partial<Record<JourneyTag, { id: string; title: string; desc: string }>> = {
    [JourneyTag.RELAX]: {
        id: 'relax',
        title: 'Reset & Healing',
        desc: 'Tập trung vào sự tĩnh lặng, thiền định và hồi phục năng lượng.',
    },
    [JourneyTag.FOODIE]: {
        id: 'foodie',
        title: 'Food Adventure',
        desc: 'Khám phá ẩm thực địa phương và những quán ăn nức tiếng.',
    },
    [JourneyTag.NATURE]: {
        id: 'nature',
        title: 'Nature & Relax',
        desc: 'Hòa mình vào thiên nhiên hoang sơ và tận hưởng không khí trong lành.',
    },
    [JourneyTag.CULTURE]: {
        id: 'culture',
        title: 'Culture & History',
        desc: 'Tìm hiểu về di sản, bảo tàng và những câu chuyện lịch sử.',
    },
    [JourneyTag.CHILL]: {
        id: 'chill',
        title: 'Fun & Entertainment',
        desc: 'Những hoạt động sôi nổi, vui chơi giải trí và tiệc tùng.',
    },
};

interface TripDetailScreenProps {
    onBack: () => void;
    tripId: string;
    onOpenProfile?: () => void;
}

export const TripDetailScreen = ({ onBack, tripId, onOpenProfile }: TripDetailScreenProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'itinerary' | 'members' | 'mood'>('itinerary');
    const [tabWidth, setTabWidth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [tripData, setTripData] = useState<TripData | null>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(0)).current;

    const formatCompactCurrency = (value?: number) => {
        if (!value || Number.isNaN(value) || value <= 0) return '0 đ';
        return `${(value / 1000000).toFixed(1)} Tr`;
    };

    const getTripDurationDays = (journey: Journey) => {
        const start = new Date(journey.start_date).getTime();
        const end = new Date(journey.end_date).getTime();
        if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
            return Math.max(journey.days?.length || 1, 1);
        }
        return Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1);
    };

    const getTripStatus = (journey: Journey) => {
        const now = Date.now();
        const start = new Date(journey.start_date).getTime();
        const end = new Date(journey.end_date).getTime();

        if (!Number.isNaN(end) && end < now) return 'Chuyến đã kết thúc';
        if (!Number.isNaN(start) && start <= now) return 'Chuyến đang diễn ra';
        return 'Chuyến đã sắp tới';
    };

    const formatTimeLabel = (time: string | null | undefined, fallback: number) => {
        if (!time) return `${String(8 + fallback).padStart(2, '0')}:00`;
        const parsed = new Date(time);
        if (Number.isNaN(parsed.getTime())) return `${String(8 + fallback).padStart(2, '0')}:00`;
        return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
    };

    const safeNameFromId = (id: string) => `User ${id.slice(-4).toUpperCase()}`;

    useEffect(() => {
        const fetchTripDetail = async () => {
            try {
                setIsLoading(true);

                const [journeyResult, budgetResult, albumResult] = await Promise.allSettled([
                    JourneyService.findOne(tripId),
                    JourneyService.getBudgetBreakdown(tripId),
                    JourneyService.getAlbum(tripId),
                ]);

                if (journeyResult.status !== 'fulfilled') {
                    throw journeyResult.reason;
                }

                const journey = journeyResult.value;

                const stopIds = Array.from(
                    new Set(
                        (journey.days || [])
                            .flatMap((day) => day.stops || [])
                            .map((stop) => stop.place_id)
                            .filter(Boolean)
                    )
                );

                const placeMap = new Map<string, { name: string; address?: string }>();
                if (stopIds.length) {
                    const placeResults = await Promise.allSettled(stopIds.map((id) => PlacesService.findOne(id)));
                    placeResults.forEach((result, index) => {
                        if (result.status === 'fulfilled') {
                            placeMap.set(stopIds[index], {
                                name: result.value.name,
                                address: result.value.address,
                            });
                        }
                    });
                }

                const memberIds = Array.from(new Set([journey.owner_id, ...(journey.members || []).map((member) => member.user_id)].filter(Boolean)));
                const profileResults = await Promise.allSettled(memberIds.map((id) => UsersService.getPublicProfile(id)));
                const profileMap = new Map<string, { name: string; avatar?: string }>();

                profileResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        const profile = result.value;
                        profileMap.set(memberIds[index], {
                            name: profile.fullName,
                            avatar: profile.avatar,
                        });
                    }
                });

                const mappedMembers = (journey.members || []).map((member) => {
                    const profile = profileMap.get(member.user_id);
                    return {
                        id: member.user_id,
                        name: profile?.name || safeNameFromId(member.user_id),
                        avatar: profile?.avatar,
                        role: roleLabelMap[member.role] || member.role,
                        joinedAt: member.joined_at,
                        isOwner: member.user_id === journey.owner_id || member.role === JourneyMemberRole.HOST,
                    };
                });

                if (!mappedMembers.some((member) => member.isOwner)) {
                    const ownerProfile = profileMap.get(journey.owner_id);
                    mappedMembers.unshift({
                        id: journey.owner_id,
                        name: ownerProfile?.name || safeNameFromId(journey.owner_id),
                        avatar: ownerProfile?.avatar,
                        role: 'Host',
                        joinedAt: '',
                        isOwner: true,
                    });
                }

                const itinerary = (journey.days || []).map((day) => ({
                    day: day.day_number,
                    title: `Lịch trình ngày ${day.day_number}`,
                    date: day.date,
                    activities: (day.stops || []).map((stop, index) => ({
                        id: stop._id,
                        time: formatTimeLabel(stop.start_time, index),
                        title: placeMap.get(stop.place_id)?.name || `Địa điểm ${index + 1}`,
                        description: stop.note || `Chi phí dự kiến: ${(stop.estimated_cost || 0).toLocaleString('vi-VN')} đ`,
                        status: stop.status,
                    })),
                }));

                const memberCount = Math.max(mappedMembers.length, journey.planned_members_count || 0, 1);
                const journeyTags = journey.tags && journey.tags.length ? journey.tags : [JourneyTag.CHILL];
                const moodVotes = journeyTags.map((tag, index) => {
                    const mood = moodLabelMap[tag] || moodLabelMap[JourneyTag.CHILL]!;
                    return {
                        id: mood.id,
                        title: mood.title,
                        desc: mood.desc,
                        votes: index === 0 ? memberCount : 0,
                    };
                });

                const firstStop = (journey.days || []).flatMap((day) => day.stops || [])[0];
                const firstPlace = firstStop ? placeMap.get(firstStop.place_id) : undefined;
                const breakdownBudget =
                    budgetResult.status === 'fulfilled'
                        ? Number(
                            budgetResult.value?.total_budget ||
                            budgetResult.value?.total_planned ||
                            budgetResult.value?.planned_budget ||
                            budgetResult.value?.budget_limit ||
                            0
                        )
                        : 0;

                const journeyBudgetLimit = Number((journey as any).budget_limit || (journey as any).budgetLimit || 0);
                const journeyTotalBudget = Number(journey.total_budget || 0);
                const perPersonBudget = Number(journey.cost_per_person || 0);
                const membersPlanned = Math.max(journey.planned_members_count || mappedMembers.length || 1, 1);
                const inferredTotalBudget = perPersonBudget > 0 ? perPersonBudget * membersPlanned : 0;

                const budgetFromBreakdown =
                    breakdownBudget ||
                    journeyTotalBudget ||
                    journeyBudgetLimit ||
                    inferredTotalBudget ||
                    perPersonBudget;

                const albumCount =
                    albumResult.status === 'fulfilled' && Array.isArray(albumResult.value)
                        ? albumResult.value.length
                        : 0;

                setTripData({
                    title: journey.name,
                    location: firstPlace?.address || (firstPlace?.name ? `${firstPlace.name}, Việt Nam` : 'Việt Nam'),
                    budget: formatCompactCurrency(budgetFromBreakdown),
                    days: `${getTripDurationDays(journey)} Ngày`,
                    status: getTripStatus(journey),
                    itinerary,
                    members: mappedMembers,
                    inviteCode: journey.invite_code,
                    moodVotes,
                });

                if (albumCount > 0) {
                    setTripData((prev) =>
                        prev
                            ? {
                                ...prev,
                                status: `${prev.status} • ${albumCount} ảnh`,
                            }
                            : prev
                    );
                }
            } catch {
                Alert.alert('Không thể tải chuyến đi', 'Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTripDetail();
    }, [tripId]);

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
                    onPress={onOpenProfile}
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
