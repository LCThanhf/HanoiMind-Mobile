import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { JourneyService } from '../services/journeyService/journey.service';
import { AiService } from '../services/aiService/ai.service';
import { AIPlanRequest, AiMood } from '../services/aiService/ai.type';
import { JourneyTag } from '../services/journeyService/journey.type';
import { UsersService } from '../services/userService/user.service';
import { formatCurrencyVnd, TripManageStop, useTripDetailData } from './tripDetail/useTripDetailData';
import { TripStopCard } from './tripDetail/TripStopCard';
import { MainTab } from './BottomTabBar';
import { Button, ScreenHeader } from './shared';

interface TripItineraryManageScreenProps {
  tripId: string;
  onBack: () => void;
  onOpenTripRoute: () => void;
  onAddPlace: (dayNumber: number) => void;
  onOpenPlaceDetail: (placeId: string) => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const moodMap: Partial<Record<JourneyTag, AiMood>> = {
  [JourneyTag.RELAX]: 'RESET_HEALING',
  [JourneyTag.CHILL]: 'CHILL_CAFE',
  [JourneyTag.NATURE]: 'NATURE_EXPLORE',
  [JourneyTag.FOODIE]: 'FOOD_LOCAL',
};

const moodBadgeLabelMap: Partial<Record<JourneyTag, string>> = {
  [JourneyTag.RELAX]: 'Healing',
  [JourneyTag.CHILL]: 'Chill',
  [JourneyTag.NATURE]: 'Nature',
  [JourneyTag.FOODIE]: 'Foodie',
  [JourneyTag.CULTURE]: 'Culture',
};

const formatDateToHHmm = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const toMinutesFromHHmm = (value: string) => {
  // Try to find HH:mm anywhere in the string (e.g., '14:00', '14:00:00', 'T14:00', ' 14:00 ')
  const match = value.match(/(?:^|\s|T)([01]?\d|2[0-3]):([0-5]\d)/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const parseTimeToDate = (value: string | null | undefined, fallbackMinutes: number) => {
  const now = new Date();
  const fromHHmm = typeof value === 'string' ? value.match(/(?:^|\s|T)([01]?\d|2[0-3]):([0-5]\d)/) : null;
  
  if (fromHHmm) {
    now.setHours(Number(fromHHmm[1]), Number(fromHHmm[2]), 0, 0);
    return now;
  }

  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const hours = Math.floor(fallbackMinutes / 60);
  const minutes = fallbackMinutes % 60;
  now.setHours(hours, minutes, 0, 0);
  return now;
};

const addMinutes = (source: Date, minutes: number) => new Date(source.getTime() + minutes * 60 * 1000);

interface EditingStopState {
  dayId: string;
  dayNumber: number;
  stop: TripManageStop;
}

export const TripItineraryManageScreen = ({
  tripId,
  onBack,
  onOpenTripRoute,
  onAddPlace,
  onOpenPlaceDetail,
  activeTab,
  onTabChange,
}: TripItineraryManageScreenProps) => {
  const insets = useSafeAreaInsets();
  const { isLoading, error, tripData, dayPlans, budgetSummary, journey, refresh } = useTripDetailData(tripId);
  const [deletingStopId, setDeletingStopId] = useState<string>('');
  const [savingStopId, setSavingStopId] = useState<string>('');
  const [optimizing, setOptimizing] = useState(false);
  const [requesterUserId, setRequesterUserId] = useState<string>('');
  const [editingStop, setEditingStop] = useState<EditingStopState | null>(null);
  const [draftStartTime, setDraftStartTime] = useState<Date>(() => parseTimeToDate('08:00', 8 * 60));
  const [draftEndTime, setDraftEndTime] = useState<Date>(() => parseTimeToDate('10:00', 10 * 60));
  const [androidPickerField, setAndroidPickerField] = useState<'start' | 'end' | null>(null);

  const progress = useMemo(() => {
    if (!budgetSummary.limit) return 0;
    return Math.min(100, Math.round((budgetSummary.planned / budgetSummary.limit) * 100));
  }, [budgetSummary.limit, budgetSummary.planned]);

  const moodBadgeLabel = useMemo(() => {
    const firstTag = journey?.tags?.[0];
    if (!firstTag) return 'Healing';
    return moodBadgeLabelMap[firstTag] || 'Healing';
  }, [journey?.tags]);

  const handleDeleteStop = (dayNumber: number, stopId: string) => {
    Alert.alert('Xóa địa điểm', 'Bạn có chắc muốn xóa địa điểm khỏi lịch trình?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingStopId(stopId);
            await JourneyService.removeStop(tripId, dayNumber, stopId);
            await refresh({ silent: true });
          } catch {
            Alert.alert('Không thể xóa địa điểm', 'Vui lòng thử lại sau.');
          } finally {
            setDeletingStopId('');
          }
        },
      },
    ]);
  };

  const extractUserId = (user: unknown): string | null => {
    if (!user || typeof user !== 'object') return null;

    const candidate = user as Record<string, unknown>;
    const resolved = candidate.id || candidate._id || candidate.user_id;

    if (typeof resolved !== 'string') return null;
    const normalized = resolved.trim();
    return normalized ? normalized : null;
  };

  const resolveRequesterUserId = async (): Promise<string> => {
    if (requesterUserId) return requesterUserId;

    const me = await UsersService.getMe();
    const resolved = extractUserId(me);

    if (!resolved) {
      throw new Error('Không lấy được requester_user_id từ hồ sơ người dùng.');
    }

    setRequesterUserId(resolved);
    return resolved;
  };

  const handleOptimize = async () => {
    if (!journey) return;

    const allPlaceIds = Array.from(new Set(dayPlans.flatMap((day) => day.stops.map((stop) => stop.placeId)).filter(Boolean)));
    const totalDays = Math.max(dayPlans.length, 1);
    const totalBudget = budgetSummary.limit || budgetSummary.planned || 0;
    const selectedMood: AiMood = (journey.tags?.length ? moodMap[journey.tags[0]] : undefined) || 'NATURE_EXPLORE';
    const inferredMode: 'solo' | 'group' = (journey.planned_members_count || 1) > 1 ? 'group' : 'solo';
    const computedDailyBudget = Math.max(Math.floor(totalBudget / totalDays), 150000);
    const safeDailyBudget = Math.min(computedDailyBudget, totalBudget);
    const maxPlacesPerDay = Math.min(5, Math.max(1, Math.max(...dayPlans.map((day) => day.stops.length), 3)));

    const payload: AIPlanRequest = {
      total_budget_vnd: totalBudget,
      daily_budget_vnd: safeDailyBudget,
      mode: inferredMode,
      max_places_per_day: maxPlacesPerDay,
      travel_style: 'balanced',
    };

    if (allPlaceIds.length) {
      payload.place_ids = allPlaceIds;
    }

    if (inferredMode === 'group') {
      payload.mood_distribution = { [selectedMood]: 1 };
      payload.requester_user_id = await resolveRequesterUserId();
    } else {
      payload.mood = selectedMood;
    }

    try {
      setOptimizing(true);
      const aiResult = await AiService.runAiPlan(tripId, payload);
      await refresh({ silent: true });

      const generatedStops = (aiResult.days || []).reduce((total, day) => total + (day.stops?.length || 0), 0);
      Alert.alert(
        'Đã nhận kết quả AI',
        `AI đã tạo đề xuất ${generatedStops} điểm dừng. Ứng dụng đã đồng bộ lại dữ liệu từ backend chính.`
      );
    } catch (e: any) {
      const apiMessage =
        e?.response?.data?.message ||
        e?.response?.data?.detail?.[0]?.msg ||
        e?.response?.data?.error ||
        (typeof e?.response?.data === 'string' ? e.response.data : null) ||
        (e?.response?.data ? JSON.stringify(e.response.data) : null) ||
        e?.message;

      Alert.alert('Không thể tối ưu lịch trình', apiMessage || 'Vui lòng thử lại sau.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleOpenTimeEditor = (dayId: string, dayNumber: number, stop: TripManageStop) => {
    const fallbackStart = 8 * 60;
    const startSeed = stop.startTimeRaw || stop.startTimeLabel;
    const endSeed = stop.endTimeRaw || stop.endTimeLabel || undefined;

    const nextStart = parseTimeToDate(startSeed, fallbackStart);
    const nextEnd = parseTimeToDate(endSeed, fallbackStart + 120);

    setDraftStartTime(nextStart);
    setDraftEndTime(nextEnd.getTime() > nextStart.getTime() ? nextEnd : addMinutes(nextStart, 120));
    setAndroidPickerField(null);
    setEditingStop({ dayId, dayNumber, stop });
  };

  const closeTimeEditor = () => {
    setAndroidPickerField(null);
    setEditingStop(null);
  };

  const handleAndroidPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setAndroidPickerField(null);
      return;
    }

    if (!selected || !androidPickerField) {
      setAndroidPickerField(null);
      return;
    }

    if (androidPickerField === 'start') {
      setDraftStartTime(selected);
      if (selected.getTime() >= draftEndTime.getTime()) {
        setDraftEndTime(addMinutes(selected, 120));
      }
    } else {
      setDraftEndTime(selected);
    }

    setAndroidPickerField(null);
  };

  const handleSaveStopTime = async () => {
    if (!editingStop) return;

    const startTime = formatDateToHHmm(draftStartTime);
    const endTime = formatDateToHHmm(draftEndTime);
    const startMinutes = toMinutesFromHHmm(startTime);
    const endMinutes = toMinutesFromHHmm(endTime);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      Alert.alert('Giờ chưa hợp lệ', 'Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    try {
      setSavingStopId(editingStop.stop.id);
      await JourneyService.updateStop(tripId, editingStop.dayId, editingStop.stop.id, {
        start_time: startTime,
        end_time: endTime,
      });
      await refresh({ silent: true });
      closeTimeEditor();
      Alert.alert('Đã cập nhật', 'Đã lưu khung giờ cho địa điểm.');
    } catch {
      Alert.alert('Không thể cập nhật giờ', 'Vui lòng thử lại sau.');
    } finally {
      setSavingStopId('');
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={tripData?.title || 'Chi tiết hành trình'} onBack={onBack} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2B8EF0" />
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 190 }}>
            <View className="px-5 pt-4 pb-3">
              <View
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: '#F8FAFC',
                  shadowColor: '#0F172A',
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 5 },
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center">
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M3 7a2 2 0 0 1 2-2h14v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                        stroke="#2B8EF0"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M19 10h2v4h-2a2 2 0 1 1 0-4z"
                        stroke="#2B8EF0"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text className="text-[14px] text-gray-700 ml-1.5" style={{ fontWeight: '600' }}>
                      Ngân sách dự kiến
                    </Text>
                  </View>
                  <Text className="text-[24px]" style={{ color: '#2B8EF0', fontWeight: '700' }}>
                    {formatCurrencyVnd(budgetSummary.limit || budgetSummary.planned)}
                  </Text>
                </View>
                <Text className="text-[12px] text-gray-500 mb-3">Tiết kiệm là quốc sách!</Text>

                <View style={{ height: 6, borderRadius: 999, backgroundColor: '#E5E7EB' }}>
                  <View
                    style={{
                      width: `${progress}%`,
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: '#2B8EF0',
                    }}
                  />
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-[12px] text-gray-600">Đã dùng: {formatCurrencyVnd(budgetSummary.planned)}</Text>
                  <Text className="text-[12px] text-gray-600">Còn lại: {formatCurrencyVnd(budgetSummary.remaining)}</Text>
                </View>
              </View>

              <Button
                activeOpacity={0.85}
                onPress={onOpenTripRoute}
                className="items-center justify-center rounded-xl mt-3"
                style={{
                  height: 46,
                  backgroundColor: '#EEF6FF',
                  borderWidth: 1,
                  borderColor: '#BFDBFE',
                }}
              >
                <Text className="text-[14px]" style={{ color: '#1D4ED8', fontWeight: '700' }}>
                  Xem lộ trình tham quan
                </Text>
              </Button>
            </View>

            {!!error && (
              <View className="px-5 pb-2">
                <Text className="text-red-500 text-[13px]" style={{ fontWeight: '500' }}>
                  {error}
                </Text>
              </View>
            )}

            {dayPlans.map((day) => (
              <View key={day.dayNumber} className="px-5 mb-5">
                <View className="mb-3">
                  <Text className="text-[26px] text-gray-900" style={{ fontWeight: '700' }}>
                    NGÀY {day.dayNumber}
                  </Text>
                </View>

                {day.stops.length ? (
                  day.stops.map((item, idx) => (
                    <TripStopCard
                      key={item.id}
                      stop={item}
                      moodLabel={moodBadgeLabel}
                      deleting={deletingStopId === item.id}
                      showConnector={idx < day.stops.length - 1}
                      onDelete={() => handleDeleteStop(day.dayNumber, item.id)}
                      onEditTime={() => handleOpenTimeEditor(day.dayId || String(day.dayNumber), day.dayNumber, item)}
                      onPress={() => onOpenPlaceDetail(item.placeId)}
                    />
                  ))
                ) : (
                  <View
                    className="rounded-2xl px-4 py-3 mb-3"
                    style={{ backgroundColor: '#F8FAFC' }}
                  >
                    <Text className="text-[13px] text-gray-500" style={{ fontWeight: '400' }}>
                      Tự do khám phá, di chuyển.
                    </Text>
                  </View>
                )}

                <Button
                  activeOpacity={0.8}
                  onPress={() => onAddPlace(day.dayNumber)}
                  className="items-center justify-center rounded-xl"
                  style={{
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                    borderStyle: 'dashed',
                    height: 48,
                    backgroundColor: '#EFF6FF',
                  }}
                >
                  <Text className="text-[14px]" style={{ color: '#3B82F6', fontWeight: '600' }}>
                    + Thêm địa điểm mới
                  </Text>
                </Button>
              </View>
            ))}
            <View style={{ height: 160 + insets.bottom }} />
          </ScrollView>

          <View
            className="absolute left-0 right-0 bg-white px-5 pt-3"
            style={{
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingBottom: 16,
              bottom: 60 + insets.bottom,
            }}
          >
            <Button
              className="items-center justify-center rounded-xl"
              style={{ height: 48, backgroundColor: '#2B8EF0' }}
              disabled={optimizing}
              onPress={handleOptimize}
            >
              {optimizing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[15px]" style={{ fontWeight: '700' }}>
                  Tối ưu lại bằng AI
                </Text>
              )}
            </Button>
            <Text className="text-[11px] text-gray-500 mt-2" style={{ fontWeight: '500' }}>
              * Bạn có thể sắp xếp lịch trình bằng cách thêm hoặc xóa địa điểm. Nhấn giữ để thay đổi giờ
            </Text>
          </View>

          <Modal visible={!!editingStop} transparent animationType="fade" onRequestClose={closeTimeEditor}>
            <Pressable
              onPress={closeTimeEditor}
              style={{
                flex: 1,
                backgroundColor: 'rgba(15, 23, 42, 0.42)',
                justifyContent: 'center',
                paddingHorizontal: 20,
              }}
            >
              <Pressable
                onPress={(event) => event.stopPropagation()}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 }}
              >
                <Text className="text-[16px] text-gray-900" style={{ fontWeight: '700' }}>
                  Chỉnh giờ địa điểm
                </Text>
                <Text className="text-[12px] text-gray-500 mt-1" style={{ fontWeight: '500' }}>
                  {editingStop?.stop.title || 'Địa điểm'} • Ngày {editingStop?.dayNumber}
                </Text>

                <View className="mt-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-[14px] text-gray-700" style={{ fontWeight: '600' }}>
                      Bắt đầu: <Text style={{ color: '#111827', fontWeight: '700' }}>{formatDateToHHmm(draftStartTime)}</Text>
                    </Text>
                    <Button onPress={() => setAndroidPickerField('start')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text className="text-[14px]" style={{ color: '#2563EB', fontWeight: '700' }}>
                        Đổi giờ
                      </Text>
                    </Button>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] text-gray-700" style={{ fontWeight: '600' }}>
                      Kết thúc: <Text style={{ color: '#111827', fontWeight: '700' }}>{formatDateToHHmm(draftEndTime)}</Text>
                    </Text>
                    <Button onPress={() => setAndroidPickerField('end')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text className="text-[14px]" style={{ color: '#2563EB', fontWeight: '700' }}>
                        Đổi giờ
                      </Text>
                    </Button>
                  </View>
                </View>

                <View className="flex-row items-center justify-end mt-5">
                  <Button onPress={closeTimeEditor} className="mr-4" disabled={!!savingStopId}>
                    <Text className="text-[14px] text-gray-500" style={{ fontWeight: '600' }}>
                      Hủy
                    </Text>
                  </Button>
                  <Button
                    onPress={handleSaveStopTime}
                    disabled={!!savingStopId}
                    className="rounded-lg px-4"
                    style={{ height: 38, backgroundColor: '#2B8EF0', justifyContent: 'center' }}
                  >
                    {savingStopId ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-[14px] text-white" style={{ fontWeight: '700' }}>
                        Lưu giờ
                      </Text>
                    )}
                  </Button>
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          {androidPickerField ? (
            <DateTimePicker
              value={androidPickerField === 'start' ? draftStartTime : draftEndTime}
              mode="time"
              display="default"
              onChange={handleAndroidPickerChange}
            />
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
};
