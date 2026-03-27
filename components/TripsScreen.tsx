import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { MainTab } from './BottomTabBar';
import { AppHeader } from './AppHeader';
import { JourneyService } from '../services/journeyService/journey.service';
import { Journey } from '../services/journeyService/journey.type';

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeJourneyList = (payload: unknown): Journey[] => {
    if (Array.isArray(payload)) return payload as Journey[];
    if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: Journey[] }).data;
    }
    return [];
};

const VIETNAMESE_MOOD_MAP: Record<string, string> = {
    CHILL: 'Chill',
    RELAX: 'Thư giãn',
    NATURE: 'Lãng mạn',
    FOODIE: 'Ẩm thực',
    ADVENTURE: 'Phiêu lưu',
    CULTURE: 'Văn hóa',
    CITY: 'Năng động',
    BEACH: 'Biển',
    MOUNTAIN: 'Núi',
    FAMILY: 'Gia đình',
    COUPLE: 'Cặp đôi',
    HISTORICAL: 'Lịch sử',
};

const DEFAULT_TRIP_IMAGE = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=500&q=80';

const getTripDuration = (journey: Journey) => {
    const start = new Date(journey.start_date).getTime();
    const end = new Date(journey.end_date).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
        return `${journey.days?.length || 0} ngày`;
    }
    return `${Math.max(1, Math.round((end - start) / DAY_MS) + 1)} ngày`;
};

const getStatusBadge = (journey: Journey): { label: string; bg: string; text: string } => {
    const now = Date.now();
    const start = new Date(journey.start_date).getTime();
    const end = new Date(journey.end_date).getTime();
    if (!Number.isNaN(end) && end < now) return { label: 'Hoàn thành', bg: '#D1FAE5', text: '#16A34A' };
    if (!Number.isNaN(start) && start <= now) return { label: 'Đang diễn ra', bg: '#FEF3C7', text: '#D97706' };
    const daysLeft = Math.ceil((start - now) / DAY_MS);
    return { label: `Còn ${daysLeft} ngày`, bg: '#EFF6FF', text: '#3B82F6' };
};

const getMoodLabel = (journey: Journey): string => {
    const firstTag = journey.tags?.[0];
    if (!firstTag) return 'Chuyến đi mới';
    return VIETNAMESE_MOOD_MAP[firstTag] || firstTag;
};

const getLocationLabel = (journey: Journey): string => {
    const tripName = (journey.name || '').trim();
    const firstPart = tripName.split('-')[0]?.trim();
    if (firstPart) return firstPart;
    return 'Việt Nam';
};

const isSoloTrip = (journey: Journey): boolean => {
    const memberCount = journey.members?.length ?? 0;
    const plannedCount = journey.planned_members_count ?? 0;
    const maxCount = Math.max(memberCount, plannedCount);
    return maxCount <= 1;
};

interface TripsScreenProps {
    activeTab: MainTab;
    onTabChange: (tab: MainTab) => void;
    onCreateTrip: () => void;
    onTripClick: (tripId: string) => void;
    onOpenProfile: () => void;
    onLogout: () => void;
    onOpenNotifications?: () => void;
}

export const TripsScreen = ({ activeTab, onTabChange, onCreateTrip, onTripClick, onOpenProfile, onLogout, onOpenNotifications }: TripsScreenProps) => {
    const [myTrips, setMyTrips] = useState<Journey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tripTab, setTripTab] = useState<'personal' | 'group'>('personal');
    const [inviteCode, setInviteCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const fetchScreenData = async () => {
            try {
                setIsLoading(true);
                const tripRes = await JourneyService.findMy();
                setMyTrips(normalizeJourneyList(tripRes));
            } finally {
                setIsLoading(false);
            }
        };
        fetchScreenData();
    }, []);

    const filteredTrips = useMemo(() => {
        if (tripTab === 'personal') {
            return myTrips.filter(isSoloTrip);
        }
        return myTrips.filter((trip) => !isSoloTrip(trip));
    }, [myTrips, tripTab]);

    const handleJoinByCode = async () => {
        const code = inviteCode.trim();
        if (!code) return;
        try {
            setIsJoining(true);
            const res = await JourneyService.joinByInviteCode(code);
            if (res?._id) {
                setMyTrips((prev) => {
                    const existed = prev.some((trip) => trip._id === res._id);
                    if (existed) return prev;
                    return [res, ...prev];
                });
                onTripClick(res._id);
            }
        } catch {
            // ignore — user feedback can be added later
        } finally {
            setIsJoining(false);
            setInviteCode('');
        }
    };

    const sectionTripCount = filteredTrips.length;

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC]">
            <View>
                <AppHeader variant="homeTrips" onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNotifications={onOpenNotifications} />

                <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
                    <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 3, flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => setTripTab('personal')}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                backgroundColor: tripTab === 'personal' ? 'white' : 'transparent',
                                borderRadius: 9,
                                paddingVertical: 8,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: tripTab === 'personal' ? '#2B8EF0' : '#374151', fontWeight: '800', fontSize: 15 }}>CÁ NHÂN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setTripTab('group')}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                backgroundColor: tripTab === 'group' ? 'white' : 'transparent',
                                borderRadius: 9,
                                paddingVertical: 8,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: tripTab === 'group' ? '#2B8EF0' : '#374151', fontWeight: '800', fontSize: 15 }}>CÙNG NHÓM</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827' }}>Chuyến Đi Của Bạn</Text>
                        <View style={{ backgroundColor: '#EBF5FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 }}>
                            <Text style={{ color: '#2B8EF0', fontSize: 14, fontWeight: '700' }}>{sectionTripCount} Trips</Text>
                        </View>
                    </View>

                    {isLoading ? (
                        <View style={{ paddingVertical: 42, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#2B8EF0" />
                        </View>
                    ) : sectionTripCount === 0 ? (
                        <View
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                paddingVertical: 28,
                                paddingHorizontal: 18,
                                alignItems: 'center',
                                marginTop: 4,
                                marginBottom: 16,
                            }}
                        >
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 4 }}>
                                Chưa có chuyến đi nào ở mục này
                            </Text>
                            <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                                Tạo kế hoạch mới hoặc nhập mã để tham gia chuyến đi sẵn có.
                            </Text>
                        </View>
                    ) : (
                        filteredTrips.map((trip) => {
                            const statusBadge = getStatusBadge(trip);
                            const tripMode = isSoloTrip(trip) ? 'Solo' : 'Nhóm';
                            const membersCount = Math.max(trip.members?.length ?? 0, trip.planned_members_count ?? 0, 1);

                            return (
                                <TouchableOpacity
                                    key={trip._id}
                                    activeOpacity={0.88}
                                    onPress={() => onTripClick(trip._id)}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 9,
                                        marginBottom: 12,
                                        flexDirection: 'row',
                                    }}
                                >
                                    <View style={{ width: 92, height: 92, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                                        <Image source={{ uri: trip.avatar || DEFAULT_TRIP_IMAGE }} style={{ width: '100%', height: '100%' }} />
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 6,
                                                left: 6,
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 999,
                                                backgroundColor: '#2B8EF0',
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{tripMode}</Text>
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827', flex: 1 }} numberOfLines={2}>
                                                    {trip.name}
                                                </Text>
                                                <Text style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 16 }}>...</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                                                    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" fill="#6B7280" />
                                                </Svg>
                                                <Text style={{ fontSize: 12, color: '#374151' }} numberOfLines={1}>
                                                    {getLocationLabel(trip)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                                <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#3B82F6" strokeWidth="1.8" />
                                                <Path d="M16 2v4M8 2v4M3 10h18" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" />
                                            </Svg>
                                            <Text style={{ fontSize: 12, color: '#111827', marginLeft: 4 }}>{getTripDuration(trip)}</Text>

                                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 14 }}>
                                                <Path d="M12 21s-6.716-4.298-9-8.076C1.4 10.2 2.565 6.98 5.3 5.79c1.808-.789 3.635-.31 4.7.743.734.723 1.264.723 2 0 1.064-1.052 2.89-1.532 4.7-.743 2.735 1.19 3.9 4.409 2.3 7.133C18.716 16.702 12 21 12 21Z" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                            <Text style={{ fontSize: 12, color: '#374151', marginLeft: 4 }}>{getMoodLabel(trip)}</Text>
                                        </View>

                                        <View style={{ marginTop: 4 }}>
                                            <Text style={{ fontSize: 10, color: statusBadge.text, backgroundColor: statusBadge.bg, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                                {statusBadge.label} • {membersCount} thành viên
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}

                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={onCreateTrip}
                        style={{
                            backgroundColor: '#EBF5FF',
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#BFDBFE',
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 6,
                        }}
                    >
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: '#2B8EF0',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                            }}
                        >
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                            </Svg>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#1D4ED8', fontSize: 15, fontWeight: '800' }}>Tạo kế hoạch mới</Text>
                            <Text style={{ color: '#3B82F6', fontSize: 12, marginTop: 1 }}>
                                Sử dụng AI để tối ưu lịch trình của bạn ngay!
                            </Text>
                        </View>
                        <Text style={{ color: '#3B82F6', fontSize: 20, lineHeight: 20 }}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => setInviteCode(inviteCode ? '' : ' ')}
                        style={{
                            backgroundColor: '#EBF5FF',
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#BFDBFE',
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 12,
                        }}
                    >
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: '#2B8EF0',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                            }}
                        >
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M9 11V7a3 3 0 1 1 6 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <Rect x="7" y="11" width="10" height="8" rx="2" stroke="white" strokeWidth="2" />
                            </Svg>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#1D4ED8', fontSize: 15, fontWeight: '800' }}>Nhập mã để tham gia</Text>
                            <Text style={{ color: '#3B82F6', fontSize: 12, marginTop: 1 }}>
                                Nhập mã mời để tham gia chuyến đi có sẵn
                            </Text>
                        </View>
                        <Text style={{ color: '#3B82F6', fontSize: 20, lineHeight: 20 }}>›</Text>
                    </TouchableOpacity>

                    {inviteCode !== '' && (
                        <View
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#BFDBFE',
                                marginTop: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <TextInput
                                value={inviteCode.trim()}
                                onChangeText={setInviteCode}
                                placeholder="Nhập mã mời"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                style={{ flex: 1, paddingVertical: 6, fontSize: 14, color: '#111827' }}
                            />
                            <TouchableOpacity
                                onPress={handleJoinByCode}
                                disabled={!inviteCode.trim() || isJoining}
                                style={{
                                    backgroundColor: '#2B8EF0',
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    opacity: inviteCode.trim() ? 1 : 0.4,
                                }}
                            >
                                {isJoining ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>Tham gia</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

