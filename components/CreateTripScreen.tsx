import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { JourneyService } from '../services/journeyService/journey.service';
import { JourneyTag, JourneyVisibility } from '../services/journeyService/journey.type';
import { PlacesService } from '../services/placeService/place.service';
import { Place } from '../services/placeService/place.type';
import { AiService } from '../services/aiService/ai.service';

const daysOptions = ['1 ngày', '2 ngày', '3 ngày', '4 ngày', '5 ngày', '6 ngày', '7 ngày', '10 ngày', '14 ngày'];

type MoodId = 'reset' | 'chill' | 'explore' | 'food';

const moodOptions: {
  id: MoodId;
  title: string;
  budget: string;
  icon: 'healing' | 'cafe' | 'nature' | 'food';
  color: string;
  bgColor: string;
}[] = [
    {
      id: 'reset',
      title: 'Reset & Healing',
      budget: '500k - 800k/ngày',
      icon: 'healing',
      color: '#22C55E',
      bgColor: '#ECFDF5',
    },
    {
      id: 'chill',
      title: 'Chill & Cafe',
      budget: '400k - 700k/ngày',
      icon: 'cafe',
      color: '#2B8EF0',
      bgColor: '#EBF5FF',
    },
    {
      id: 'explore',
      title: 'Explore Nature',
      budget: '600k - 900k/ngày',
      icon: 'nature',
      color: '#D4A574',
      bgColor: '#FEF3E2',
    },
    {
      id: 'food',
      title: 'Food & Local',
      budget: '800k - 1.2M/ngày',
      icon: 'food',
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
  ];

const HealingIcon = ({ color = '#22C55E' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M3 8c3-3 6-3 9 0s6 3 9 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 14c3-3 6-3 9 0s6 3 9 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CafeIcon = ({ color = '#2B8EF0' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M17 8h1a4 4 0 0 1 0 8h-1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 1v3M10 1v3M14 1v3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const NatureIcon = ({ color = '#D4A574' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M6.5 21c3-3.5 6-5 9.5-5 0-4-1.5-9-9.5-12 0 6 .5 9 3 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 12c2-1 4-1.5 6-1.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FoodIcon = ({ color = '#EF4444' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 2v20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = ({ color = '#2B8EF0' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const MoneyIcon = ({ color = '#2B8EF0' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path
      d="M12 6v12M9 9.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5S14.33 11 13.5 11h-3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const SparkleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="white"
    />
  </Svg>
);

export const CreateTripScreen = ({ onClose }: { onClose?: () => void }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [tripName, setTripName] = useState('');
  const [selectedDays, setSelectedDays] = useState('2 ngày');
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [budget, setBudget] = useState('');
  const [budgetFocused, setBudgetFocused] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodId>('reset');
  const [isSoloMode, setIsSoloMode] = useState(true);

  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [loadingMorePlaces, setLoadingMorePlaces] = useState(false);
  const [placesSearch, setPlacesSearch] = useState('');
  const [placesPage, setPlacesPage] = useState(1);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [isAiSelectingPlaces, setIsAiSelectingPlaces] = useState(false);

  const [createdJourneyId, setCreatedJourneyId] = useState<string | null>(null);
  const [seededStops, setSeededStops] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const moodTagMap: Record<MoodId, JourneyTag> = {
    reset: JourneyTag.RELAX,
    chill: JourneyTag.CHILL,
    explore: JourneyTag.NATURE,
    food: JourneyTag.FOODIE,
  };

  const moodAiMap: Record<MoodId, string> = {
    reset: 'RESET_HEALING',
    chill: 'CHILL_CAFE',
    explore: 'EXPLORE_NATURE',
    food: 'FOOD_LOCAL',
  };

  const parseDaysCount = (value: string): number => {
    const days = parseInt(value, 10);
    if (Number.isNaN(days) || days <= 0) return 1;
    return days;
  };

  const parseBudgetValue = (raw: string): number | undefined => {
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) return undefined;
    const parsed = Number(digitsOnly);
    if (Number.isNaN(parsed) || parsed <= 0) return undefined;
    return parsed;
  };

  const buildIsoDateRange = (daysCount: number) => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + Math.max(0, daysCount - 1));
    return {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };
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

      return null;
    }

    return null;
  };

  const getReadableErrorMessage = (error: unknown, fallback: string): string => {
    const errorRecord = error as {
      message?: unknown;
      response?: {
        data?: unknown;
        status?: number;
      };
    };

    const message =
      unwrapErrorMessage(errorRecord?.response?.data) ||
      unwrapErrorMessage(errorRecord?.message);

    if (message) return message;

    if (typeof errorRecord?.response?.status === 'number') {
      return `${fallback} (HTTP ${errorRecord.response.status})`;
    }

    return fallback;
  };

  const ensureJourneyForAi = async () => {
    if (createdJourneyId) return createdJourneyId;

    const cleanName = tripName.trim() || 'Hành trình mới';
    const budgetLimit = parseBudgetValue(budget);
    const daysCount = parseDaysCount(selectedDays);
    const { start_date, end_date } = buildIsoDateRange(daysCount);

    const created = await JourneyService.create({
      name: cleanName,
      start_date,
      end_date,
      budget_limit: budgetLimit,
      planned_members_count: isSoloMode ? 1 : 4,
      visibility: isSoloMode ? JourneyVisibility.PRIVATE : JourneyVisibility.FRIENDS,
      tags: [moodTagMap[selectedMood]],
    });

    setCreatedJourneyId(created._id);
    return created._id;
  };

  const extractSuggestedPlaceIds = (payload: unknown): string[] => {
    const collected: string[] = [];

    const visit = (node: unknown) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (typeof node !== 'object') return;

      const record = node as Record<string, unknown>;
      const candidates = [
        record.place_id,
        record.placeId,
      ];

      candidates.forEach((value) => {
        if (typeof value === 'string' && value.trim()) {
          collected.push(value);
        }
      });

      Object.values(record).forEach(visit);
    };

    visit(payload);
    return Array.from(new Set(collected));
  };

  const handleAiSelectPlaces = async () => {
    if (isAiSelectingPlaces || isProcessing || placesLoading) return;

    const daysCount = parseDaysCount(selectedDays);
    const desiredCount = Math.max(3, Math.min(12, daysCount * 2));

    try {
      setIsAiSelectingPlaces(true);

      if (!places.length) {
        await fetchPlaces({ nextPage: 1, reset: true, silent: true });
      }

      const journeyId = await ensureJourneyForAi();
      const suggestionPayload = await AiService.suggestNextPlaces(journeyId, {
        max_places: desiredCount,
        seed_place_id: selectedPlaceIds[0],
      });

      const aiIds = extractSuggestedPlaceIds(suggestionPayload);
      let finalIds = aiIds.slice(0, desiredCount);

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

      if (!finalIds.length) {
        const fallbackIds = [...places]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, desiredCount)
          .map((p) => p._id);
        finalIds = fallbackIds;
      }

      if (!finalIds.length) {
        Alert.alert('AI chưa có gợi ý', 'Hiện chưa có đủ dữ liệu để AI chọn địa điểm. Bạn chọn thủ công giúp mình nhé.');
        return;
      }

      setSelectedPlaceIds(finalIds);
      Alert.alert('AI đã chọn xong', `Đã chọn ${finalIds.length} địa điểm gợi ý cho chuyến đi của bạn.`);
    } catch (error) {
      Alert.alert(
        'Không thể chọn bằng AI',
        getReadableErrorMessage(error, 'Hệ thống AI đang bận hoặc chuyến đi chưa đủ dữ liệu. Bạn thử lại sau nhé.')
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
      const meta = res?.meta && typeof res.meta === 'object' ? (res.meta as Record<string, any>) : null;
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

  const selectedPlaces = useMemo(() => {
    const ids = new Set(selectedPlaceIds);
    return places.filter((p) => ids.has(p._id));
  }, [places, selectedPlaceIds]);

  const filteredPlaces = places;

  const getMoodIcon = (iconType: string, color: string) => {
    switch (iconType) {
      case 'healing':
        return <HealingIcon color={color} />;
      case 'cafe':
        return <CafeIcon color={color} />;
      case 'nature':
        return <NatureIcon color={color} />;
      case 'food':
        return <FoodIcon color={color} />;
      default:
        return <HealingIcon color={color} />;
    }
  };

  const validateStepOne = () => {
    const cleanName = tripName.trim();
    if (!cleanName) {
      Alert.alert('Thiếu thông tin', 'Bạn cần nhập tên chuyến đi trước khi sang bước tiếp theo.');
      return false;
    }

    const budgetLimit = parseBudgetValue(budget);
    if (budgetLimit !== undefined && budgetLimit < 500000) {
      Alert.alert('Ngân sách chưa hợp lệ', 'Ngân sách tối thiểu là 500.000 VND.');
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

  const handleProceed = async () => {
    if (isProcessing) return;

    if (currentStep === 1) {
      if (!validateStepOne()) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!selectedPlaceIds.length) {
        Alert.alert('Thiếu địa điểm', 'Bạn hãy chọn ít nhất 1 địa điểm ở bước 2.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    const cleanName = tripName.trim();
    const budgetLimit = parseBudgetValue(budget);
    const daysCount = parseDaysCount(selectedDays);
    const { start_date, end_date } = buildIsoDateRange(daysCount);

    try {
      setIsProcessing(true);

      let journeyId = createdJourneyId;
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
        setCreatedJourneyId(journeyId);
      }

      if (!seededStops && selectedPlaceIds.length) {
        for (let i = 0; i < selectedPlaceIds.length; i += 1) {
          const placeId = selectedPlaceIds[i];
          const relatedPlace = places.find((p) => p._id === placeId);
          await JourneyService.addStop(journeyId, {
            day_index: i % daysCount,
            place_id: placeId,
            end_time: '18:00',
            estimated_cost: relatedPlace?.estimated_cost_vnd || 0,
          });
        }
        setSeededStops(true);
      }

      const safeTotalBudget = budgetLimit ?? 0;
      const safeDailyBudget = daysCount > 0 ? Math.floor(safeTotalBudget / daysCount) : safeTotalBudget;
      const selectedMoodCode = moodAiMap[selectedMood];

      const proposal = await AiService.createPlan(journeyId, {
        total_days: daysCount,
        mode: isSoloMode ? 'solo' : 'group',
        mood: selectedMoodCode,
        mood_distribution: { [selectedMoodCode]: 1 },
        total_budget_vnd: safeTotalBudget,
        daily_budget_vnd: safeDailyBudget,
        hours_per_day: 8,
        travel_style: selectedMood === 'reset' ? 'relaxing' : selectedMood === 'explore' ? 'sightseeing' : 'balanced',
        max_places_per_day: Math.max(3, Math.ceil(selectedPlaceIds.length / daysCount)),
      });

      if (proposal?._id) {
        try {
          await AiService.acceptProposal(proposal._id);
        } catch {
          // Keep proposal in draft if auto-accept fails.
        }
      }

      Alert.alert('Thành công', 'Đã tạo hành trình và chạy tối ưu AI.');
      onClose?.();
    } catch (error) {
      const message = getReadableErrorMessage(error, 'Không thể chạy luồng tạo hành trình AI lúc này.');
      Alert.alert('Thất bại', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const actionLabel =
    currentStep === 1
      ? 'TIẾP THEO: CHỌN ĐỊA ĐIỂM'
      : currentStep === 2
        ? 'TIẾP THEO: TỐI ƯU AI'
        : 'BẮT ĐẦU TỐI ƯU AI';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 pt-12 pb-4">
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6l12 12" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text className="text-[17px] text-gray-900" style={{ fontWeight: '600' }}>
          Tạo chuyến đi mới
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="h-px bg-gray-200" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => showDaysDropdown && setShowDaysDropdown(false)}>
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

          {currentStep === 1 && (
            <>
              <View className="px-5">
                <View className="flex-row items-center mb-4">
                  <View style={{ width: 4, height: 20, backgroundColor: '#2B8EF0', borderRadius: 2, marginRight: 10 }} />
                  <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                    NHẬP THÔNG TIN CƠ BẢN
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-[13px] text-gray-600 mb-2" style={{ fontWeight: '500' }}>
                    Tên chuyến đi
                  </Text>
                  <View className="flex-row items-center px-4 rounded-xl" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 52 }}>
                    <TextInput
                      className="flex-1 text-[15px]"
                      style={{ fontWeight: '500', color: '#111827' }}
                      placeholder="VD: Đà Lạt - Sương Mờ"
                      placeholderTextColor="#9CA3AF"
                      value={tripName}
                      onChangeText={setTripName}
                      maxLength={80}
                    />
                  </View>
                </View>

                <View className="mb-3 relative">
                  <View className="flex-row items-center mb-2">
                    <CalendarIcon />
                    <Text className="text-[13px] text-gray-600 ml-2" style={{ fontWeight: '500' }}>
                      Số ngày hành trình
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="flex-row items-center justify-between px-4"
                    style={{
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: showDaysDropdown ? '#2B8EF0' : '#E5E7EB',
                      height: 52,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      borderBottomLeftRadius: showDaysDropdown ? 0 : 12,
                      borderBottomRightRadius: showDaysDropdown ? 0 : 12,
                      borderBottomWidth: showDaysDropdown ? 0 : 1,
                    }}
                    onPress={() => setShowDaysDropdown(!showDaysDropdown)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-[15px] text-gray-900" style={{ fontWeight: '500' }}>
                      {selectedDays}
                    </Text>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M6 9l6 6 6-6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>

                  {showDaysDropdown && (
                    <View
                      className="absolute left-0 right-0 bg-white overflow-hidden"
                      style={{
                        top: 78,
                        borderWidth: 1,
                        borderTopWidth: 0,
                        borderColor: '#2B8EF0',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        zIndex: 1000,
                      }}
                    >
                      <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
                        {daysOptions.map((days, index) => (
                          <TouchableOpacity
                            key={days}
                            className="px-4 py-3.5"
                            style={{
                              backgroundColor: selectedDays === days ? '#EBF5FF' : 'white',
                              borderBottomWidth: index < daysOptions.length - 1 ? 1 : 0,
                              borderBottomColor: '#F3F4F6',
                            }}
                            onPress={() => {
                              setSelectedDays(days);
                              setShowDaysDropdown(false);
                            }}
                          >
                            <Text className="text-[15px]" style={{ color: selectedDays === days ? '#2B8EF0' : '#374151', fontWeight: selectedDays === days ? '600' : '500' }}>
                              {days}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View className="mb-1">
                  <View className="flex-row items-center mb-2">
                    <MoneyIcon />
                    <Text className="text-[13px] text-gray-600 ml-2" style={{ fontWeight: '500' }}>
                      Tổng ngân sách dự kiến
                    </Text>
                  </View>
                  <View
                    className="flex-row items-center px-4 rounded-xl"
                    style={{
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: budgetFocused ? '#2B8EF0' : '#E5E7EB',
                      height: 52,
                    }}
                  >
                    <TextInput
                      className="flex-1 text-[15px]"
                      style={{ fontWeight: '500', color: '#111827' }}
                      placeholder="VD: 2.000.000"
                      placeholderTextColor="#9CA3AF"
                      value={budget}
                      onChangeText={setBudget}
                      onFocus={() => setBudgetFocused(true)}
                      onBlur={() => setBudgetFocused(false)}
                      keyboardType="numeric"
                    />
                    <Text className="text-[14px] text-gray-500" style={{ fontWeight: '600' }}>
                      VND
                    </Text>
                  </View>
                </View>
                <Text className="text-[11px] text-gray-400 mb-6" style={{ fontWeight: '400' }}>
                  Ngân sách tối thiểu từ 500.000 VND
                </Text>
              </View>

              <View className="px-5 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View style={{ width: 4, height: 20, backgroundColor: '#2B8EF0', borderRadius: 2, marginRight: 10 }} />
                    <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                      CHỌN TÂM TRẠNG
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsSoloMode(!isSoloMode)} activeOpacity={0.7}>
                    <Text className="text-[12px]" style={{ color: '#2B8EF0', fontWeight: '600' }}>
                      {isSoloMode ? 'Đổi mode: Solo' : 'Đổi mode: Group'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
                  {moodOptions.map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    return (
                      <TouchableOpacity
                        key={mood.id}
                        style={{ width: '50%', paddingHorizontal: 6, marginBottom: 12 }}
                        onPress={() => setSelectedMood(mood.id)}
                        activeOpacity={0.7}
                      >
                        <View className="items-center py-5 rounded-2xl relative" style={{ backgroundColor: mood.bgColor, borderWidth: 2, borderColor: isSelected ? '#2B8EF0' : 'transparent' }}>
                          {isSelected && (
                            <View className="absolute items-center justify-center" style={{ top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#2B8EF0' }}>
                              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                <Path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </Svg>
                            </View>
                          )}
                          <View className="items-center justify-center mb-3" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'white' }}>
                            {getMoodIcon(mood.icon, mood.color)}
                          </View>
                          <Text className="text-[14px] mb-1" style={{ color: '#1F2937', fontWeight: '600' }}>
                            {mood.title}
                          </Text>
                          <Text className="text-[11px]" style={{ color: '#6B7280', fontWeight: '400' }}>
                            {mood.budget}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {currentStep === 2 && (
            <View className="px-5 pb-6">
              <View className="flex-row items-center mb-4">
                <View style={{ width: 4, height: 20, backgroundColor: '#2B8EF0', borderRadius: 2, marginRight: 10 }} />
                <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                  CHỌN ĐỊA ĐIỂM YÊU THÍCH
                </Text>
              </View>

              <View style={{ backgroundColor: '#EBF5FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
                <Text style={{ color: '#1E3A8A', fontSize: 13, fontWeight: '600' }}>
                  Đã chọn {selectedPlaceIds.length} địa điểm
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAiSelectPlaces}
                disabled={isAiSelectingPlaces || isProcessing || placesLoading}
                style={{
                  backgroundColor: '#2B8EF0',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isAiSelectingPlaces || isProcessing || placesLoading ? 0.75 : 1,
                }}
              >
                {isAiSelectingPlaces ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <SparkleIcon />
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '700', marginLeft: 8 }}>
                      Để AI chọn địa điểm giúp mình
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center px-4 rounded-xl mb-3" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 48 }}>
                <TextInput
                  className="flex-1 text-[14px]"
                  placeholder="Tìm địa điểm..."
                  placeholderTextColor="#9CA3AF"
                  value={placesSearch}
                  onChangeText={setPlacesSearch}
                />
              </View>

              {placesLoading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator size="large" color="#2B8EF0" />
                </View>
              ) : (
                filteredPlaces.map((place) => {
                  const selected = selectedPlaceIds.includes(place._id);
                  return (
                    <TouchableOpacity
                      key={place._id}
                      activeOpacity={0.8}
                      onPress={() => togglePlace(place._id)}
                      style={{
                        backgroundColor: selected ? '#EBF5FF' : 'white',
                        borderColor: selected ? '#2B8EF0' : '#E5E7EB',
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          borderWidth: 1.5,
                          borderColor: selected ? '#2B8EF0' : '#D1D5DB',
                          backgroundColor: selected ? '#2B8EF0' : 'white',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {selected ? (
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                            <Path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        ) : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
                          {place.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>
                          {place.address}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{Math.round(place.rating || 0)}★</Text>
                    </TouchableOpacity>
                  );
                })
              )}

              {!placesLoading && !filteredPlaces.length ? (
                <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
                  Không tìm thấy địa điểm phù hợp.
                </Text>
              ) : null}

              {!placesLoading && filteredPlaces.length > 0 && hasMorePlaces ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => fetchPlaces({ nextPage: placesPage + 1, reset: false })}
                  disabled={loadingMorePlaces}
                  style={{
                    height: 44,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D1E6FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F8FBFF',
                    marginTop: 6,
                  }}
                >
                  {loadingMorePlaces ? (
                    <ActivityIndicator color="#2B8EF0" size="small" />
                  ) : (
                    <Text style={{ color: '#2B8EF0', fontSize: 13, fontWeight: '700' }}>Xem thêm địa điểm</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {currentStep === 3 && (
            <View className="px-5 pb-10">
              <View className="flex-row items-center mb-4">
                <View style={{ width: 4, height: 20, backgroundColor: '#2B8EF0', borderRadius: 2, marginRight: 10 }} />
                <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                  XÁC NHẬN & CHẠY AI
                </Text>
              </View>

              <View style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, marginBottom: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 }}>{tripName || 'Chưa đặt tên'}</Text>
                <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 2 }}>Số ngày: {selectedDays}</Text>
                <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 2 }}>Mode: {isSoloMode ? 'Solo' : 'Group'}</Text>
                <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 2 }}>Mood: {moodOptions.find((m) => m.id === selectedMood)?.title}</Text>
                <Text style={{ fontSize: 13, color: '#4B5563' }}>Ngân sách: {budget || 'Chưa nhập'}</Text>
              </View>

              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Địa điểm đã chọn ({selectedPlaces.length})</Text>
              {selectedPlaces.map((place) => (
                <View key={place._id} style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: '#111827', fontWeight: '600' }}>{place.name}</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>{place.address}</Text>
                </View>
              ))}

              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
                Bước này sẽ tạo hành trình, gán địa điểm vào lịch trình ban đầu và gọi AI tối ưu tự động.
              </Text>
            </View>
          )}

          <View className="h-24" />
        </Pressable>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-white">
        {currentStep > 1 ? (
          <TouchableOpacity
            onPress={() => setCurrentStep((prev) => (prev === 3 ? 2 : 1))}
            activeOpacity={0.8}
            style={{ alignItems: 'center', marginBottom: 8 }}
          >
            <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600' }}>Quay lại bước trước</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          className="flex-row items-center justify-center py-5 rounded-2xl"
          style={{
            backgroundColor: '#2B8EF0',
            shadowColor: '#2B8EF0',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 5,
            opacity: isProcessing ? 0.75 : 1,
          }}
          onPress={handleProceed}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <SparkleIcon />
              <Text className="text-white text-[15px] ml-2" style={{ fontWeight: '700' }}>
                {actionLabel}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
