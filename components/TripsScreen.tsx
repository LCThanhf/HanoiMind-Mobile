import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { ActionCard } from './shared';
import { TripCard } from './cards';
import { JourneyService } from '../services/journeyService/journey.service';
import { Journey } from '../services/journeyService/journey.type';

const normalizeJourneyList = (payload: unknown): Journey[] => {
    if (Array.isArray(payload)) return payload as Journey[];
    if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: Journey[] }).data;
    }
    return [];
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
                        filteredTrips.map((trip) => (
                            <TripCard
                                key={trip._id}
                                trip={trip}
                                onPress={onTripClick}
                                variant="detailed"
                            />
                        ))
                    )}

                    <ActionCard
                        onPress={onCreateTrip}
                        marginTop={6}
                        title="Tạo kế hoạch mới"
                        subtitle="Sử dụng AI để tối ưu lịch trình của bạn ngay!"
                        leftIcon={
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: '#2B8EF0',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                    <Path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                                </Svg>
                            </View>
                        }
                    />

                    <ActionCard
                        onPress={() => setInviteCode(inviteCode ? '' : ' ')}
                        marginTop={12}
                        title="Nhập mã để tham gia"
                        subtitle="Nhập mã mời để tham gia chuyến đi có sẵn"
                        leftIcon={
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: '#2B8EF0',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                    <Path d="M9 11V7a3 3 0 1 1 6 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <Rect x="7" y="11" width="10" height="8" rx="2" stroke="white" strokeWidth="2" />
                                </Svg>
                            </View>
                        }
                    />

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

