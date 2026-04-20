import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { MoodVoteEntry, MoodVoteOption } from './types';
import { Button, CardContainer } from '../../shared';
import { JourneyService } from '../../../services/journeyService/journey.service';
import { MoodVoteSelector, moodIdToJourneyMood } from './MoodVoteSelector';

const debugMoodVoteTab = (...args: unknown[]) => {
    if (__DEV__) {
        console.log('[MoodVoteTab]', ...args);
    }
};

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
    tripId: string;
    moodVoteEntries?: MoodVoteEntry[];
    isRegenerating?: boolean;
    onVoteSubmitted?: () => Promise<void> | void;
    onRegenerateItinerary?: () => Promise<void> | void;
}

const EMPTY_MOOD_VOTE_ENTRIES: MoodVoteEntry[] = [];

interface VoteResultsProps {
    membersCount: number;
    moodVoteEntries: MoodVoteEntry[];
}

const VoteResults = memo(({ membersCount, moodVoteEntries }: VoteResultsProps) => {
    const groupedVotes = useMemo(
        () =>
            moodVoteEntries.reduce<Record<string, MoodVoteEntry[]>>((acc, entry) => {
                const key = entry.mood_title || entry.mood || 'Khác';
                if (!acc[key]) acc[key] = [];
                acc[key].push(entry);
                return acc;
            }, {}),
        [moodVoteEntries]
    );
    const voteGroups = useMemo(() => Object.entries(groupedVotes), [groupedVotes]);

    return (
        <>
            <View className="h-px bg-gray-200 mt-8 mb-6" />

            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                    Kết quả bình chọn
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    {moodVoteEntries.length} / {membersCount} đã vote
                </Text>
            </View>

            {moodVoteEntries.length === 0 ? (
                <View
                    style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: 14,
                        padding: 20,
                        alignItems: 'center',
                        marginBottom: 20,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                    }}
                >
                    <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                        Chưa có thành viên nào bình chọn
                    </Text>
                </View>
            ) : (
                <CardContainer style={{ borderRadius: 16, marginBottom: 20 }}>
                    {voteGroups.map(([moodTitle, voters], groupIdx) => (
                        <View key={moodTitle}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 16,
                                    paddingTop: groupIdx === 0 ? 14 : 10,
                                    paddingBottom: 6,
                                }}
                            >
                                <View
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: '#2B8EF0',
                                        marginRight: 8,
                                    }}
                                />
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', flex: 1 }}>
                                    {moodTitle}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                                    {voters.length} người
                                </Text>
                            </View>

                            {voters.map((entry) => (
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
                                    {entry.user_avatar ? (
                                        <Image
                                            source={{ uri: entry.user_avatar }}
                                            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 18,
                                                backgroundColor: '#DBEAFE',
                                                marginRight: 10,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#2B8EF0' }}>
                                                {(entry.user_name || '?').charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}

                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 }}>
                                        {entry.user_name || 'Thành viên'}
                                    </Text>

                                    <View
                                        style={{
                                            backgroundColor: '#EBF5FF',
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 20,
                                        }}
                                    >
                                        <Text style={{ fontSize: 11, color: '#2B8EF0', fontWeight: '600' }}>
                                            {moodTitle}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {groupIdx < voteGroups.length - 1 ? (
                                <View style={{ height: 6, backgroundColor: '#F8FAFC' }} />
                            ) : null}
                        </View>
                    ))}

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderTopWidth: 1,
                            borderTopColor: '#F3F4F6',
                        }}
                    >
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
        </>
    );
});

export const MoodVoteTab = memo(({
    options,
    membersCount,
    tripName,
    tripId,
    moodVoteEntries = EMPTY_MOOD_VOTE_ENTRIES,
    isRegenerating = false,
    onVoteSubmitted,
    onRegenerateItinerary,
}: MoodVoteTabProps) => {
    const firstMoodId = options[0]?.id ?? '';
    const [selectedMood, setSelectedMood] = useState<string>(firstMoodId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const renderCountRef = React.useRef(0);
    const previousStateRef = React.useRef({
        selectedMood,
        optionsLength: options.length,
        moodVoteEntriesLength: moodVoteEntries.length,
        isRegenerating,
        isSubmitting,
        tripId,
    });

    renderCountRef.current += 1;

    useEffect(() => {
        if (!options.length) {
            if (selectedMood) {
                debugMoodVoteTab('reset selected mood because options are empty', {
                    previousMood: selectedMood,
                });
                setSelectedMood('');
            }
            return;
        }

        if (!options.some((option) => option.id === selectedMood)) {
            debugMoodVoteTab('sync selected mood with options', {
                previousMood: selectedMood,
                nextMood: firstMoodId,
            });
            setSelectedMood(firstMoodId);
        }
    }, [firstMoodId, options, selectedMood]);

    const handleSelect = useCallback((id: string) => {
        debugMoodVoteTab('handle select', {
            previousMood: selectedMood,
            nextMood: id,
        });
        setSelectedMood((currentMood) => (currentMood === id ? currentMood : id));
    }, [selectedMood]);

    const handleSubmit = useCallback(async () => {
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
            debugMoodVoteTab('submit vote start', {
                selectedMood,
                tripId,
            });
            setIsSubmitting(true);
            await JourneyService.voteMood(tripId, { mood: journeyMood });
            await onVoteSubmitted?.();
            Alert.alert('Thành công', 'Đã gửi bình chọn thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.message || error.message || 'Không thể gửi bình chọn.';
            Alert.alert('Thất bại', msg);
        } finally {
            setIsSubmitting(false);
        }
    }, [onVoteSubmitted, selectedMood, tripId]);

    debugMoodVoteTab('render', {
        renderCount: renderCountRef.current,
        selectedMood,
        optionsLength: options.length,
        moodVoteEntriesLength: moodVoteEntries.length,
        isRegenerating,
        isSubmitting,
        tripId,
    });

    useEffect(() => {
        const previous = previousStateRef.current;
        const changedFields = {
            selectedMood: previous.selectedMood !== selectedMood,
            optionsLength: previous.optionsLength !== options.length,
            moodVoteEntriesLength: previous.moodVoteEntriesLength !== moodVoteEntries.length,
            isRegenerating: previous.isRegenerating !== isRegenerating,
            isSubmitting: previous.isSubmitting !== isSubmitting,
            tripId: previous.tripId !== tripId,
        };

        debugMoodVoteTab('commit', {
            renderCount: renderCountRef.current,
            changedFields,
            state: {
                selectedMood,
                optionsLength: options.length,
                moodVoteEntriesLength: moodVoteEntries.length,
                isRegenerating,
                isSubmitting,
                tripId,
            },
        });

        previousStateRef.current = {
            selectedMood,
            optionsLength: options.length,
            moodVoteEntriesLength: moodVoteEntries.length,
            isRegenerating,
            isSubmitting,
            tripId,
        };
    }, [isRegenerating, isSubmitting, moodVoteEntries.length, options.length, selectedMood, tripId]);

    return (
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
            <MoodVoteSelector
                tripName={tripName}
                options={options}
                selectedMood={selectedMood}
                onMoodChange={handleSelect}
            />

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
                {isSubmitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Gửi bình chọn</Text>
                )}
            </Button>

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

            <VoteResults membersCount={membersCount} moodVoteEntries={moodVoteEntries} />

            <Button
                activeOpacity={0.7}
                onPress={onRegenerateItinerary}
                disabled={isSubmitting || isRegenerating}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 52,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: isSubmitting || isRegenerating ? '#FCD34D' : '#F59E0B',
                    backgroundColor: isSubmitting || isRegenerating ? '#FFFBEB' : 'white',
                    marginBottom: 16,
                    opacity: isSubmitting || isRegenerating ? 0.8 : 1,
                }}
            >
                {isRegenerating ? (
                    <ActivityIndicator color="#F59E0B" />
                ) : (
                    <>
                        <StarSparkleIcon />
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#F59E0B', marginLeft: 8 }}>
                            Tạo lại lộ trình theo số đông
                        </Text>
                    </>
                )}
            </Button>

            <Text
                style={{
                    fontSize: 12,
                    color: '#6B7280',
                    fontWeight: '400',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    lineHeight: 18,
                    paddingHorizontal: 10,
                }}
            >
                * Hành động này sẽ thay đổi hoạt động hàng ngày nhưng vẫn giữ nguyên ngân sách và số ngày đi.
            </Text>
        </View>
    );
});
