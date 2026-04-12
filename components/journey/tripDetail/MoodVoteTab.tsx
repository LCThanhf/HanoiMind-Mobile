import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Animated, Alert, ActivityIndicator, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { MoodVoteOption } from './types';
import { Button, AvatarStack, CardContainer, PillBadge } from '../../shared';
import { JourneyService } from '../../../services/journeyService/journey.service';
import { JourneyMood } from '../../../services/journeyService/journey.type';

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

interface MoodVoteEntry {
    user_id: string;
    user_name: string;
    user_avatar?: string;
    mood: string;
    mood_title: string;
    voted_at: string;
}

interface MoodVoteTabProps {
    options: MoodVoteOption[];
    membersCount: number;
    tripName: string;
    tripId: string;
    currentUserName?: string;
    moodVoteEntries?: MoodVoteEntry[]; // danh sách ai đã vote mood gì
}

const moodIconById: Record<string, React.ReactElement> = {
    // Reset & Healing (id: 'relax')
    relax: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22C12 22 20 18 20 10C20 2 12 2 12 2C12 2 4 2 4 10C4 18 12 22 12 22Z" fill="#BEF264" />
            <Path d="M12 22V10M12 14C10 12 8 13 8 13" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
    ),
    // Food Adventure (id: 'foodie')
    foodie: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M4 12C4 16 7 20 12 20C17 20 20 16 20 12H4Z" fill="#F43F5E" />
            <Path d="M2 12H22M8 4H16M10 8H14" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 3V7M12 2V6M16 3V7" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
        </Svg>
    ),
    // Nature & Relax (id: 'nature')
    nature: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22V15" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <Path d="M12 15L8 20M12 15L16 20M12 3C8 3 5 6 5 10C5 13 7.5 15 12 15C16.5 15 19 13 19 10C19 6 16 3 12 3Z" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" strokeLinejoin="round" />
        </Svg>
    ),
    // Fun & Entertainment (id: 'chill')
    chill: (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M21 3L14 10M14 10L10 14M14 10L18 14M14 10L10 6M3 21L10 14M21 8V3H16M3 5L5 7M6 2L8 4M19 19L17 17M22 18L20 16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 16L12 12M18 12L20 10M16 12L18 14" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
        </Svg>
    ),
};

// Map từ mood id frontend sang JourneyMood enum của backend
const moodIdToJourneyMood: Record<string, JourneyMood> = {
    relax: JourneyMood.RESET_HEALING,
    foodie: JourneyMood.FOOD_ADVENTURE,
    nature: JourneyMood.NATURE_RELAX,
    chill: JourneyMood.FUN_ENTERTAINMENT,
};

export const MoodVoteTab = ({ options, membersCount, tripName, tripId, currentUserName, moodVoteEntries = [] }: MoodVoteTabProps) => {
    const [selectedMood, setSelectedMood] = useState<string>(options[0]?.id || '');
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const arrowAnim   = useRef(new Animated.Value(0)).current;
    const heightAnim  = useRef(new Animated.Value(0)).current;

    const ITEM_HEIGHT     = 68;
    const DROPDOWN_HEIGHT = options.length * ITEM_HEIGHT + 12;

    const toggleDropdown = () => {
        const opening = !isOpen;
        setIsOpen(opening);
        Animated.parallel([
            Animated.timing(arrowAnim, {
                toValue: opening ? 1 : 0,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(heightAnim, {
                toValue: opening ? DROPDOWN_HEIGHT : 0,
                duration: 260,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handleSelect = (id: string) => {
        setSelectedMood(id);
        setIsOpen(false);
        Animated.parallel([
            Animated.timing(arrowAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            Animated.timing(heightAnim, { toValue: 0, duration: 260, useNativeDriver: false }),
        ]).start();
    };

    const handleSubmit = async () => {
        if (!selectedMood) {
            Alert.alert('Thông báo', 'Vui lòng chọn mood trước khi gửi.');
            return;
        }
        const journeyMood = moodIdToJourneyMood[selectedMood];
        if (!journeyMood) {
            Alert.alert('Lỗi', 'Mood không hợp lệ.');
            return;
        }
        try {
            setIsSubmitting(true);
            await JourneyService.voteMood(tripId, { mood: journeyMood });
            Alert.alert('Thành công', 'Đã gửi bình chọn thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.message || error.message || 'Không thể gửi bình chọn.';
            Alert.alert('Thất bại', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group vote entries by mood_title để hiển thị
    const groupedVotes = moodVoteEntries.reduce<Record<string, MoodVoteEntry[]>>((acc, entry) => {
        const key = entry.mood_title || entry.mood || 'Khác';
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
    }, {});

    const moods = options.map((option) => ({
        ...option,
        icon: moodIconById[option.id] || moodIconById.chill,
    }));

    const activeMood = moods.find((m) => m.id === selectedMood);

    const arrowRotate = arrowAnim.interpolate({
        inputRange:  [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const voteResultAvatars = [
        { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', name: 'A' },
        { uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80', name: 'B' },
        { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', name: 'C' },
        { name: 'D' },
        { name: 'E' },
    ];

    return (
        <ScrollView
            className="flex-1 bg-white"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <StarSparkleIcon />
                    <Text className="text-[15px] text-gray-900 ml-2" style={{ fontWeight: '700' }}>
                        Lựa chọn của bạn
                    </Text>
                </View>
                <PillBadge
                    label={tripName}
                    backgroundColor="#F3F4F6"
                    textColor="#4B5563"
                    textWeight="500"
                    borderColor="#E5E7EB"
                />
            </View>

            {/* ── Trigger button (mood đang chọn + mũi tên ▼) ── */}
            <Button
                activeOpacity={0.75}
                onPress={toggleDropdown}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: isOpen ? '#2B8EF0' : '#E5E7EB',
                    shadowColor: '#0F172A',
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 2,
                }}
            >
                {/* Icon mood đang chọn */}
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: '#2B8EF0',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                    }}
                >
                    {activeMood?.icon}
                </View>

                {/* Text */}
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                        {activeMood ? activeMood.title : 'Chọn mood của bạn'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>
                        {activeMood?.desc ?? 'Nhấn để xem các lựa chọn'}
                    </Text>
                </View>

                {/* Mũi tên ▼ xoay thành ▲ khi mở */}
                <Animated.View style={{ transform: [{ rotate: arrowRotate }], marginLeft: 8 }}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M6 9l6 6 6-6"
                            stroke="#6B7280"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </Animated.View>
            </Button>

            {/* ── Dropdown list (trượt xuống, animated) ── */}
            <Animated.View style={{ height: heightAnim, overflow: 'hidden', marginTop: 6 }}>
                <View
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingVertical: 6,
                        shadowColor: '#0F172A',
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 3,
                    }}
                >
                    {moods.map((mood) => {
                        const isActive = selectedMood === mood.id;
                        return (
                            <Button
                                key={mood.id}
                                onPress={() => handleSelect(mood.id)}
                                activeOpacity={0.75}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    marginHorizontal: 6,
                                    marginVertical: 2,
                                    borderRadius: 12,
                                    backgroundColor: isActive ? '#EBF5FF' : 'transparent',
                                    borderWidth: isActive ? 1 : 0,
                                    borderColor: isActive ? '#2B8EF0' : 'transparent',
                                }}
                            >
                                {/* Icon */}
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: isActive ? '#2B8EF0' : '#F3F4F6',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                    }}
                                >
                                    {mood.icon}
                                </View>

                                {/* Text */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>
                                        {mood.title}
                                    </Text>
                                    <Text
                                        style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}
                                        numberOfLines={1}
                                    >
                                        {mood.desc}
                                    </Text>
                                </View>

                                {/* Checkmark */}
                                {isActive && (
                                    <View style={{ marginLeft: 8 }}>
                                        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                            <Circle cx="12" cy="12" r="11" fill="#2B8EF0" stroke="white" strokeWidth="2" />
                                            <Path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                    </View>
                                )}
                            </Button>
                        );
                    })}
                </View>
            </Animated.View>

            {/* Submit Button */}
            <Button
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={{
                    backgroundColor: isSubmitting ? '#7ADFFA' : '#1ECAFA',
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
                {isSubmitting
                    ? <ActivityIndicator color="white" />
                    : <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Gửi bình chọn</Text>
                }
            </Button>

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
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                    Kết quả bình chọn
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    {moodVoteEntries.length} / {membersCount} đã vote
                </Text>
            </View>

            {/* Vote list — grouped by mood */}
            {moodVoteEntries.length === 0 ? (
                <View style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    padding: 20,
                    alignItems: 'center',
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                }}>
                    <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                        Chưa có thành viên nào bình chọn
                    </Text>
                </View>
            ) : (
                <CardContainer style={{ borderRadius: 16, marginBottom: 20 }}>
                    {Object.entries(groupedVotes).map(([moodTitle, voters], groupIdx) => (
                        <View key={moodTitle}>
                            {/* Mood group header */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 16,
                                paddingTop: groupIdx === 0 ? 14 : 10,
                                paddingBottom: 6,
                            }}>
                                <View style={{
                                    width: 8, height: 8, borderRadius: 4,
                                    backgroundColor: '#2B8EF0', marginRight: 8,
                                }} />
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', flex: 1 }}>
                                    {moodTitle}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                                    {voters.length} người
                                </Text>
                            </View>

                            {/* Voters in this mood */}
                            {voters.map((entry, idx) => (
                                <View
                                    key={entry.user_id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderTopWidth: 1,
                                        borderTopColor: '#F3F4F6',
                                    }}
                                >
                                    {/* Avatar */}
                                    {entry.user_avatar ? (
                                        <Image
                                            source={{ uri: entry.user_avatar }}
                                            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                        />
                                    ) : (
                                        <View style={{
                                            width: 36, height: 36, borderRadius: 18,
                                            backgroundColor: '#DBEAFE', marginRight: 10,
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#2B8EF0' }}>
                                                {(entry.user_name || '?').charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Name */}
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 }}>
                                        {entry.user_name || 'Thành viên'}
                                    </Text>

                                    {/* Mood badge */}
                                    <View style={{
                                        backgroundColor: '#EBF5FF',
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 20,
                                    }}>
                                        <Text style={{ fontSize: 11, color: '#2B8EF0', fontWeight: '600' }}>
                                            {moodTitle}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {/* Separator between groups */}
                            {groupIdx < Object.keys(groupedVotes).length - 1 && (
                                <View style={{ height: 6, backgroundColor: '#F8FAFC' }} />
                            )}
                        </View>
                    ))}

                    {/* Footer */}
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        paddingHorizontal: 16, paddingVertical: 12,
                        borderTopWidth: 1, borderTopColor: '#F3F4F6',
                    }}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                            <Path d="M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v2" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                            <Circle cx="9" cy="7" r="4" stroke="#374151" strokeWidth="1.5" />
                            <Circle cx="17" cy="7" r="3" stroke="#374151" strokeWidth="1.5" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }}>
                            {membersCount} thành viên
                        </Text>
                    </View>
                </CardContainer>
            )}

            {/* Re-generate route button */}
            <Button
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
            </Button>

            {/* Footer Text */}
            <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '400', textAlign: 'center', fontStyle: 'italic', lineHeight: 18, paddingHorizontal: 10 }}>
                * Hành động này sẽ thay đổi hoạt động hàng ngày nhưng vẫn giữ nguyên ngân sách và số ngày đi.
            </Text>
        </ScrollView>
    );
};
