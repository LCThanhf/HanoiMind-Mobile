import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { JourneyService } from '../../services/journeyService/journey.service';
import { Journey, JourneyVisibility } from '../../services/journeyService/journey.type';
import { PlacesService } from '../../services/placeService/place.service';
import { Place } from '../../services/placeService/place.type';
import { AiService } from '../../services/aiService/ai.service';
import { AiMood } from '../../services/aiService/ai.type';
import { UsersService } from '../../services/userService/user.service';
import { moodAiMap, moodOptions, moodTagMap } from './constants';
import { SparkleIcon } from './icons';
import { StepOneInfo } from './StepOneInfo';
import { StepTwoPlaces } from './StepTwoPlaces';
import { StepThreeConfirm } from './StepThreeConfirm';
import { MoodId } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../shared';

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CreateTripScreen = ({
  onClose,
  onJourneyCreated,
}: {
  onClose?: () => void;
  onJourneyCreated?: (journeyId: string) => void;
}) => {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const next = new Date(today);
    next.setDate(next.getDate() + 1);
    return next;
  }, [today]);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState(() => formatDateInput(today));
  const [endDate, setEndDate] = useState(() => formatDateInput(tomorrow));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start');
  const [draftDate, setDraftDate] = useState(today);
  const [budget, setBudget] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodId>('reset');
  const [isSoloMode, setIsSoloMode] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [loadingMorePlaces, setLoadingMorePlaces] = useState(false);
  const [placesSearch, setPlacesSearch] = useState('');
  const [placesPage, setPlacesPage] = useState(1);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [selectedPlaceNameMap, setSelectedPlaceNameMap] = useState<Record<string, string>>({});
  const [isAiSelectingPlaces, setIsAiSelectingPlaces] = useState(false);

  const [createdJourneyId, setCreatedJourneyId] = useState<string | null>(null);
  const [seededStops, setSeededStops] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseDateInput = (value: string): Date | null => {
    const normalized = value.trim();
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);

    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return parsed;
  };

  const buildIsoDateRange = (startValue: string, endValue: string) => {
    const parsedStart = parseDateInput(startValue);
    const parsedEnd = parseDateInput(endValue);

    if (!parsedStart || !parsedEnd) {
      return {
        start_date: null,
        end_date: null,
        daysCount: 0,
      };
    }

    const start = new Date(
      Date.UTC(parsedStart.getFullYear(), parsedStart.getMonth(), parsedStart.getDate(), 0, 0, 0, 0)
    );
    const end = new Date(
      Date.UTC(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 23, 59, 59, 999)
    );

    if (end < start) {
      return {
        start_date: null,
        end_date: null,
        daysCount: 0,
      };
    }

    const diffMs = end.getTime() - start.getTime();
    const daysCount = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;

    return {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      daysCount,
    };
  };

  const parseBudgetValue = (raw: string): number | undefined => {
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) return undefined;

    const parsed = Number(digitsOnly);
    if (Number.isNaN(parsed) || parsed <= 0) return undefined;

    return parsed;
  };

  const resolveJourneyRangeDays = (journey: Journey | null | undefined, fallbackDays: number) => {
    if (journey?.days?.length) {
      return Math.max(1, journey.days.length);
    }

    const start = journey?.start_date ? new Date(journey.start_date) : null;
    const end = journey?.end_date ? new Date(journey.end_date) : null;
    if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const startUtcMidnight = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
      const endUtcMidnight = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
      const diffDays = Math.floor((endUtcMidnight - startUtcMidnight) / (24 * 60 * 60 * 1000));
      if (diffDays > 0) return diffDays;
    }

    return Math.max(1, fallbackDays);
  };

  const extractUserId = (user: unknown): string | null => {
    if (!user || typeof user !== 'object') return null;

    const candidate = user as Record<string, unknown>;
    const resolved = candidate.id || candidate._id || candidate.user_id;

    if (typeof resolved !== 'string') return null;

    const normalized = resolved.trim();
    return normalized ? normalized : null;
  };

  const resolveOwnerId = async (): Promise<string> => {
    if (ownerId) return ownerId;

    const me = await UsersService.getMe();
    const resolved = extractUserId(me);
    if (!resolved) {
      throw new Error('Khong lay duoc owner_id tu ho so nguoi dung.');
    }

    setOwnerId(resolved);
    return resolved;
  };

  const unwrapErrorMessage = (value: unknown): string | null => {
    const isIsoDateLike = (input: string) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(input);

    const isSkippableMetaKey = (key: string) =>
      [
        'timestamp',
        'createdAt',
        'updatedAt',
        'path',
        'url',
        'status',
        'statusCode',
        'code',
        'requestId',
        'traceId',
      ].includes(key);

    if (!value) return null;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (
        !trimmed ||
        trimmed === '[object Object]' ||
        trimmed.toLowerCase().includes('object object') ||
        isIsoDateLike(trimmed)
      ) {
        return null;
      }
      return trimmed;
    }

    if (Array.isArray(value)) {
      const normalized = value.map((item) => unwrapErrorMessage(item)).filter(Boolean) as string[];
      return normalized.length ? normalized.join('\n') : null;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const priorityKeys = ['message', 'error', 'details', 'reason', 'title', 'errors'];

      for (const key of priorityKeys) {
        const extracted = unwrapErrorMessage(record[key]);
        if (extracted) return extracted;
      }

      for (const [key, entry] of Object.entries(record)) {
        if (isSkippableMetaKey(key)) continue;
        const extracted = unwrapErrorMessage(entry);
        if (extracted) return extracted;
      }
    }

    return null;
  };

  const getReadableErrorMessage = (error: unknown, fallback: string): string => {
    const errorRecord = error as {
      message?: unknown;
      response?: {
        data?: unknown;
        status?: number;
        statusText?: unknown;
      };
    };

    const message =
      unwrapErrorMessage(errorRecord?.response?.data) ||
      unwrapErrorMessage(errorRecord?.message);

    if (message) return message;

    const statusText = unwrapErrorMessage(errorRecord?.response?.statusText);
    if (statusText) return statusText;

    if (typeof errorRecord?.response?.status === 'number') {
      if (errorRecord.response.status === 404) {
        return 'Not Found';
      }
      return `${fallback} (HTTP ${errorRecord.response.status})`;
    }

    return fallback;
  };

  const openDatePicker = (target: 'start' | 'end') => {
    setDatePickerTarget(target);
    const currentValue = target === 'start' ? startDate : endDate;
    const parsed = parseDateInput(currentValue) || today;
    setDraftDate(parsed);
    setShowDatePicker(true);
  };

  const handleDatePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShowDatePicker(false);
        return;
      }

      if (selected) {
        const formatted = formatDateInput(selected);
        if (datePickerTarget === 'start') setStartDate(formatted);
        else setEndDate(formatted);
      }

      setShowDatePicker(false);
      return;
    }

    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selected) {
      setDraftDate(selected);
    }
  };

  const confirmDateSelection = () => {
    const formatted = formatDateInput(draftDate);
    if (datePickerTarget === 'start') setStartDate(formatted);
    else setEndDate(formatted);
    setShowDatePicker(false);
  };

  const handleAiSelectPlaces = async () => {
    if (isAiSelectingPlaces || isProcessing || placesLoading) return;

    if (createdJourneyId) {
      Alert.alert('Da co hanh trinh AI', 'Ban da tao goi y AI cho hanh trinh nay. Hay tiep tuc buoc toi uu AI.');
      return;
    }

    const { start_date, end_date, daysCount } = buildIsoDateRange(startDate, endDate);
    if (!start_date || !end_date || daysCount <= 0) {
      Alert.alert('Ngay chua hop le', 'Hay chon ngay bat dau/ket thuc hop le tren lich va dam bao ngay ket thuc khong truoc ngay bat dau.');
      return;
    }

    const desiredCount = Math.max(3, Math.min(12, daysCount * 2));

    try {
      setIsAiSelectingPlaces(true);

      if (!places.length) {
        await fetchPlaces({ nextPage: 1, reset: true, silent: true });
      }

      const resolvedOwnerId = await resolveOwnerId();

      const suggestionPayload = await AiService.createJourneyFromRelated({
        name: tripName.trim() || 'AI goi y dia diem',
        owner_id: resolvedOwnerId,
        start_date,
        end_date,
        max_places: desiredCount,
        hours_per_day: 8,
        mode: isSoloMode ? 'solo' : 'group',
        mood: moodAiMap[selectedMood],
        auto_plan: false,
        total_budget_vnd: parseBudgetValue(budget) ?? 0,
        daily_budget_vnd: Math.max(0, Math.floor((parseBudgetValue(budget) ?? 0) / Math.max(1, daysCount))),
      });

      const finalIds = (suggestionPayload.selected_place_ids || []).slice(0, desiredCount);

      const missingIds = finalIds.filter((id) => !places.some((place) => place._id === id));
      if (missingIds.length) {
        const detailResults = await Promise.allSettled(missingIds.map((id) => PlacesService.findOne(id)));
        const fetchedPlaces = detailResults
          .filter((result): result is PromiseFulfilledResult<Place> => result.status === 'fulfilled')
          .map((result) => result.value);

        if (fetchedPlaces.length) {
          setPlaces((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const merged = [...prev];
            fetchedPlaces.forEach((place) => {
              if (!existingIds.has(place._id)) merged.push(place);
            });
            return merged;
          });
        }
      }

      if (finalIds.length) {
        setSelectedPlaceIds(finalIds);
      }
    } catch (error) {
      Alert.alert(
        'Khong the chon bang AI',
        getReadableErrorMessage(error, 'Hệ thống AI đang bận. Bạn thử lại sau nhé.')
      );
    } finally {
      setIsAiSelectingPlaces(false);
    }
  };

  const fetchPlaces = useCallback(async ({
    nextPage,
    reset,
    silent,
  }: {
    nextPage: number;
    reset: boolean;
    silent?: boolean;
  }) => {
    const query = placesSearch.trim();
    const limit = 12;

    try {
      if (!silent) {
        if (reset) setPlacesLoading(true);
        else setLoadingMorePlaces(true);
      }

      const res = await PlacesService.findAll({
        page: nextPage,
        limit,
        ...(query ? { name: query } : {}),
      });

      const incoming = Array.isArray(res?.data) ? res.data : [];
      const meta = res?.meta && typeof res.meta === 'object' ? (res.meta as Record<string, unknown>) : null;
      const hasNextByMeta =
        typeof meta?.hasNextPage === 'boolean'
          ? meta.hasNextPage
          : typeof meta?.has_next_page === 'boolean'
            ? meta.has_next_page
            : typeof meta?.totalPages === 'number' && typeof meta?.page === 'number'
              ? meta.page < meta.totalPages
              : undefined;

      const canLoadMore = typeof hasNextByMeta === 'boolean' ? hasNextByMeta : incoming.length >= limit;

      setPlacesPage(nextPage);
      setHasMorePlaces(canLoadMore);
      setPlaces((prev) => (reset ? incoming : [...prev, ...incoming]));
    } catch {
      if (!silent) {
        Alert.alert('Lỗi', 'Không tải được danh sách địa điểm từ server.');
      }
      if (reset) {
        setPlaces([]);
        setHasMorePlaces(false);
        setPlacesPage(1);
      }
    } finally {
      if (!silent) {
        if (reset) setPlacesLoading(false);
        else setLoadingMorePlaces(false);
      }
    }
  }, [placesSearch]);

  useEffect(() => {
    if (currentStep !== 2) return;

    const timer = setTimeout(() => {
      fetchPlaces({ nextPage: 1, reset: true });
    }, placesSearch.trim() ? 320 : 0);

    return () => clearTimeout(timer);
  }, [currentStep, placesSearch, fetchPlaces]);

  useEffect(() => {
    if (!selectedPlaceIds.length || !places.length) return;

    setSelectedPlaceNameMap((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const place of places) {
        if (!selectedPlaceIds.includes(place._id)) continue;
        const normalizedName = (place.name || '').trim();
        if (!normalizedName) continue;
        if (next[place._id] === normalizedName) continue;
        next[place._id] = normalizedName;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [places, selectedPlaceIds]);

  const selectedPlaceSummaries = useMemo(() => {
    if (!selectedPlaceIds.length) return [];

    return selectedPlaceIds.map((id, index) => ({
      id,
      name: selectedPlaceNameMap[id] || `Dia diem ${index + 1}`,
    }));
  }, [selectedPlaceIds, selectedPlaceNameMap]);

  const selectedPlaceDetails = useMemo(() => {
    if (!selectedPlaceIds.length) return [];

    const placeMap = new Map(places.map((place) => [place._id, place]));

    return selectedPlaceIds.map((id, index) => {
      const place = placeMap.get(id);
      return {
        id,
        name: (place?.name || selectedPlaceNameMap[id] || `Dia diem ${index + 1}`).trim(),
        address: place?.address,
        category: place?.category,
        rating: typeof place?.rating === 'number' ? place.rating : undefined,
        estimatedCostVnd: typeof place?.estimated_cost_vnd === 'number' ? place.estimated_cost_vnd : undefined,
        thumbnail: Array.isArray(place?.images) && place.images.length ? place.images[0] : undefined,
      };
    });
  }, [places, selectedPlaceIds, selectedPlaceNameMap]);

  const validateStepOne = () => {
    const cleanName = tripName.trim();
    if (!cleanName) {
      Alert.alert('Thiếu thông tin', 'Bạn cần nhập tên chuyến đi trước khi sang bước tiếp theo.');
      return false;
    }

    const budgetLimit = parseBudgetValue(budget);

    const { start_date, end_date } = buildIsoDateRange(startDate, endDate);
    if (!start_date || !end_date) {
      Alert.alert('Ngày chưa hợp lệ', 'Hãy chọn ngày bắt đầu/kết thúc hợp lệ và đảm bảo ngày kết thúc không trước ngày bắt đầu.');
      return false;
    }

    return true;
  };

  const togglePlace = (placeId: string) => {
    setSelectedPlaceIds((prev) => {
      if (prev.includes(placeId)) return prev.filter((id) => id !== placeId);
      return [...prev, placeId];
    });
  };

  const removeSelectedPlace = (placeId: string) => {
    setSelectedPlaceIds((prev) => prev.filter((id) => id !== placeId));
    setSelectedPlaceNameMap((prev) => {
      if (!prev[placeId]) return prev;
      const next = { ...prev };
      delete next[placeId];
      return next;
    });
  };

  const handleProceed = async () => {
    if (isProcessing) return;

    if (currentStep === 1) {
      if (!validateStepOne()) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!selectedPlaceIds.length) {
        Alert.alert('Thiếu địa điểm', 'Bạn cần chọn ít nhất 1 địa điểm ở bước 2.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    const cleanName = tripName.trim();
    const budgetLimit = parseBudgetValue(budget);
    const { start_date, end_date, daysCount } = buildIsoDateRange(startDate, endDate);

    if (!start_date || !end_date || daysCount <= 0) {
      Alert.alert('Ngày chưa hợp lệ', 'Không thể chạy AI vì ngày bắt đầu/kết thúc không hợp lệ.');
      return;
    }

    try {
      setIsProcessing(true);

      let journeyId = createdJourneyId;
      let journeyRangeDays = daysCount;

      if (!journeyId) {
        const created = await JourneyService.create({
          name: cleanName,
          start_date,
          end_date,
          budget_limit: budgetLimit,
          planned_members_count: isSoloMode ? 1 : 4,
          visibility: isSoloMode ? JourneyVisibility.PRIVATE : JourneyVisibility.FRIENDS,
          tags: [moodTagMap[selectedMood]],
        });
        journeyId = created._id;
        journeyRangeDays = resolveJourneyRangeDays(created, daysCount);
        setCreatedJourneyId(journeyId);
      } else {
        try {
          const existing = await JourneyService.findOne(journeyId);
          journeyRangeDays = resolveJourneyRangeDays(existing, daysCount);
        } catch {
          journeyRangeDays = Math.max(1, daysCount);
        }
      }

      const normalizedJourneyDays = Math.max(1, journeyRangeDays);

      if (!seededStops && selectedPlaceIds.length) {
        for (let i = 0; i < selectedPlaceIds.length; i += 1) {
          const placeId = selectedPlaceIds[i];
          const relatedPlace = places.find((p) => p._id === placeId);
          await JourneyService.addStop(journeyId, {
            day_index: i % normalizedJourneyDays,
            place_id: placeId,
            end_time: '18:00',
            estimated_cost: relatedPlace?.estimated_cost_vnd || 0,
          });
        }
        setSeededStops(true);
      }

      const safeTotalBudget = budgetLimit ?? 0;
      const safeDailyBudget = Math.floor(safeTotalBudget / normalizedJourneyDays);
      const selectedMoodCode = moodAiMap[selectedMood];

      const aiPlanPayload: {
        mode: 'solo' | 'group';
        mood?: AiMood;
        mood_distribution?: Partial<Record<AiMood, number>>;
        requester_user_id?: string;
        total_budget_vnd: number;
        daily_budget_vnd: number;
        hours_per_day: number;
        travel_style: 'sightseeing' | 'relaxing' | 'balanced';
        max_places_per_day: number;
        place_ids: string[];
      } = {
        mode: isSoloMode ? 'solo' : 'group',
        total_budget_vnd: safeTotalBudget,
        daily_budget_vnd: safeDailyBudget,
        hours_per_day: 8,
        travel_style: selectedMood === 'reset' ? 'relaxing' : selectedMood === 'explore' ? 'sightseeing' : 'balanced',
        max_places_per_day: Math.max(3, Math.ceil(selectedPlaceIds.length / normalizedJourneyDays)),
        place_ids: selectedPlaceIds,
      };

      if (isSoloMode) {
        aiPlanPayload.mood = selectedMoodCode;
      } else {
        aiPlanPayload.mood_distribution = { [selectedMoodCode]: 1 };
        aiPlanPayload.requester_user_id = await resolveOwnerId();
      }

      await AiService.runAiPlan(journeyId, aiPlanPayload);

      onJourneyCreated?.(journeyId);
      if (!onJourneyCreated) {
        Alert.alert('Thành công', 'Đã tạo hành trình và chạy tối ưu AI.');
        onClose?.();
      }
    } catch (error) {
      const message = getReadableErrorMessage(error, 'Không thể chạy lượng tạo hành trình AI lúc này.');
      Alert.alert('Thất bại', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const actionLabel =
    currentStep === 1
      ? 'Tiếp theo: Chọn địa điểm'
      : currentStep === 2
        ? 'Tiếp theo: Tối ưu AI'
        : 'Bắt đầu tối ưu AI';

  const dateRangeSummary = `${startDate} -> ${endDate}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 pt-12 pb-4">
        <Button onPress={onClose} activeOpacity={0.7}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6l12 12" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Button>
        <Text className="text-[17px] text-gray-900" style={{ fontWeight: '600' }}>
          Tạo chuyến đi mới
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="h-px bg-gray-200" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Pressable>
          <View className="flex-row items-center justify-center px-10 py-6">
            {[1, 2, 3].map((step, index) => (
              <React.Fragment key={step}>
                <View className="items-center">
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: currentStep >= step ? '#2B8EF0' : 'transparent',
                      borderWidth: currentStep >= step ? 0 : 1.5,
                      borderColor: '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text className="text-[13px]" style={{ color: currentStep >= step ? 'white' : '#9CA3AF', fontWeight: '600' }}>
                      {step}
                    </Text>
                  </View>
                  <Text className="text-[10px] mt-1.5" style={{ color: currentStep >= step ? '#2B8EF0' : '#9CA3AF', fontWeight: '500' }}>
                    {step === 1 ? 'THÔNG TIN' : step === 2 ? 'ĐỊA ĐIỂM' : 'AI TẠO'}
                  </Text>
                </View>

                {index < 2 ? (
                  <View
                    style={{
                      flex: 1,
                      height: 1.5,
                      backgroundColor: currentStep >= step + 1 ? '#2B8EF0' : '#E5E7EB',
                      marginHorizontal: 8,
                      marginBottom: 18,
                    }}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </View>

          {currentStep === 1 ? (
            <StepOneInfo
              tripName={tripName}
              onChangeTripName={setTripName}
              startDate={startDate}
              endDate={endDate}
              onOpenDatePicker={openDatePicker}
              budget={budget}
              onChangeBudget={setBudget}
              selectedMood={selectedMood}
              onSelectMood={setSelectedMood}
              isSoloMode={isSoloMode}
              onToggleMode={() => setIsSoloMode((prev) => !prev)}
            />
          ) : null}

          {currentStep === 2 ? (
            <StepTwoPlaces
              selectedPlaceIds={selectedPlaceIds}
              selectedPlaceSummaries={selectedPlaceSummaries}
              onRemoveSelectedPlace={removeSelectedPlace}
              isAiSelectingPlaces={isAiSelectingPlaces}
              isProcessing={isProcessing}
              placesLoading={placesLoading}
              onAiSelectPlaces={handleAiSelectPlaces}
              placesSearch={placesSearch}
              onChangePlacesSearch={setPlacesSearch}
              filteredPlaces={places}
              onTogglePlace={togglePlace}
              hasMorePlaces={hasMorePlaces}
              loadingMorePlaces={loadingMorePlaces}
              onLoadMorePlaces={() => fetchPlaces({ nextPage: placesPage + 1, reset: false })}
            />
          ) : null}

          {currentStep === 3 ? (
            <StepThreeConfirm
              tripName={tripName}
              dateRangeSummary={dateRangeSummary}
              isSoloMode={isSoloMode}
              selectedMoodTitle={moodOptions.find((m) => m.id === selectedMood)?.title}
              budget={budget}
              selectedPlaces={selectedPlaceDetails}
            />
          ) : null}

          <View className="h-24" />
        </Pressable>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-4 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        {currentStep > 1 ? (
          <Button
            onPress={() => setCurrentStep((prev) => (prev === 3 ? 2 : 1))}
            activeOpacity={0.8}
            style={{ alignItems: 'center', marginBottom: 8 }}
          >
            <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600' }}>Quay lại bước trước</Text>
          </Button>
        ) : null}

        <Button
          label={actionLabel}
          onPress={handleProceed}
          loading={isProcessing}
          rightSlot={!isProcessing ? <View style={{ marginLeft: 8 }}><SparkleIcon /></View> : null}
          style={{
            minHeight: 60,
            borderRadius: 16,
            shadowColor: '#2B8EF0',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 5,
          }}
        />
      </View>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            onPress={() => setShowDatePicker(false)}
            style={{ flex: 1, backgroundColor: 'rgba(17,24,39,0.45)', justifyContent: 'center', paddingHorizontal: 20 }}
          >
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={{ backgroundColor: 'white', borderRadius: 16, padding: 14 }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 }}>
                {datePickerTarget === 'start' ? 'Chon ngay bat dau' : 'Chon ngay ket thuc'}
              </Text>

              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                onChange={handleDatePickerChange}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 10 }}>
                <Button onPress={() => setShowDatePicker(false)} activeOpacity={0.8}>
                  <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>Huy</Text>
                </Button>
                <Button onPress={confirmDateSelection} activeOpacity={0.8}>
                  <Text style={{ color: '#2B8EF0', fontSize: 14, fontWeight: '700' }}>Chon</Text>
                </Button>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && showDatePicker ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
        />
      ) : null}
    </SafeAreaView>
  );
};
