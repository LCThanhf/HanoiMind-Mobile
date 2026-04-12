import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { JourneyService } from '../../../services/journeyService/journey.service';
import { Journey, JourneyVisibility } from '../../../services/journeyService/journey.type';
import { PlacesService } from '../../../services/placeService/place.service';
import { Place } from '../../../services/placeService/place.type';
import { AiService } from '../../../services/aiService/ai.service';
import { AiMood } from '../../../services/aiService/ai.type';
import { UsersService } from '../../../services/userService/user.service';
import { moodAiMap, moodOptions, moodTagMap } from './constants';
import { SparkleIcon } from './icons';
import { StepOneInfo } from './StepOneInfo';
import { StepTwoPlaces } from './StepTwoPlaces';
import { StepTwoManualStops } from './StepTwoManualStops';
import { StepThreeConfirm } from './StepThreeConfirm';
import { ManualStopDraft, MoodId, PlanningMode } from './types';
import { PlaceCard } from '../../cards/PlaceCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, CardContainer, SelectableCard } from '../../shared';

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToHHmm = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const toMinutesFromHHmm = (value: string) => {
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
  const [planningMode, setPlanningMode] = useState<PlanningMode>('ai');
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const [manualStops, setManualStops] = useState<ManualStopDraft[]>([]);
  const [showManualStopModal, setShowManualStopModal] = useState(false);
  const [manualPlaceKeyword, setManualPlaceKeyword] = useState('');
  const [manualPlaceResults, setManualPlaceResults] = useState<Place[]>([]);
  const [manualPlaceLoading, setManualPlaceLoading] = useState(false);
  const [selectedManualPlace, setSelectedManualPlace] = useState<Place | null>(null);
  const [manualStopDayIndex, setManualStopDayIndex] = useState(0);
  const [manualStopDate, setManualStopDate] = useState(() => formatDateInput(today));
  const [manualStopStartTime, setManualStopStartTime] = useState(() => parseTimeToDate('08:00', 8 * 60));
  const [manualStopEndTime, setManualStopEndTime] = useState(() => parseTimeToDate('10:00', 10 * 60));
  const [manualPickerMode, setManualPickerMode] = useState<'start-time' | 'end-time' | null>(null);
  const [showPlanningModeModal, setShowPlanningModeModal] = useState(false);

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

  const parseDateInput = useCallback((value: string): Date | null => {
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
  }, []);

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

  const getDayIndexFromDate = (dateValue: string, startValue: string) => {
    const parsedDate = parseDateInput(dateValue);
    const parsedStart = parseDateInput(startValue);
    if (!parsedDate || !parsedStart) return null;

    const dateUtc = Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    const startUtc = Date.UTC(parsedStart.getFullYear(), parsedStart.getMonth(), parsedStart.getDate());
    const diff = Math.floor((dateUtc - startUtc) / (24 * 60 * 60 * 1000));
    return diff >= 0 ? diff : null;
  };

  const formatDateDisplay = useCallback((value: string) => {
    const parsed = parseDateInput(value);
    if (!parsed) return value;
    const dd = String(parsed.getDate()).padStart(2, '0');
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [parseDateInput]);

  const manualStopDayOptions = useMemo(() => {
    const parsedStart = parseDateInput(startDate);
    const parsedEnd = parseDateInput(endDate);
    if (!parsedStart || !parsedEnd || parsedEnd < parsedStart) return [];

    const options: { dayIndex: number; date: string; label: string }[] = [];
    const cursor = new Date(parsedStart);
    let index = 0;

    while (cursor <= parsedEnd) {
      const iso = formatDateInput(cursor);
      options.push({
        dayIndex: index,
        date: iso,
        label: `${formatDateDisplay(iso)}`,
      });
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
      if (index > 90) break;
    }

    return options;
  }, [startDate, endDate, formatDateDisplay, parseDateInput]);

  useEffect(() => {
    if (!manualStopDayOptions.length) return;
    const safeIndex = Math.min(manualStopDayIndex, manualStopDayOptions.length - 1);
    if (safeIndex !== manualStopDayIndex) {
      setManualStopDayIndex(safeIndex);
    }
    const chosenDate = manualStopDayOptions[safeIndex].date;
    if (chosenDate !== manualStopDate) {
      setManualStopDate(chosenDate);
    }
  }, [manualStopDayOptions, manualStopDayIndex, manualStopDate]);

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
  };

  useEffect(() => {
    if (!showManualStopModal) return;

    const timer = setTimeout(async () => {
      const keyword = manualPlaceKeyword.trim();
      if (!keyword) {
        setManualPlaceResults([]);
        return;
      }

      try {
        setManualPlaceLoading(true);
        const res = await PlacesService.findAll({ page: 1, limit: 8, name: keyword });
        const incoming = Array.isArray(res?.data) ? res.data : [];
        setManualPlaceResults(incoming);
      } catch {
        setManualPlaceResults([]);
      } finally {
        setManualPlaceLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [manualPlaceKeyword, showManualStopModal]);

  const openManualStopModal = () => {
    setSelectedManualPlace(null);
    setManualPlaceKeyword('');
    setManualPlaceResults([]);
    setManualStopDayIndex(0);
    setManualStopDate(startDate);
    setManualStopStartTime(parseTimeToDate('08:00', 8 * 60));
    setManualStopEndTime(parseTimeToDate('10:00', 10 * 60));
    setManualPickerMode(null);
    setShowManualStopModal(true);
  };

  const closeManualStopModal = () => {
    setShowManualStopModal(false);
    setManualPickerMode(null);
  };

  const addManualStop = () => {
    if (!selectedManualPlace) {
      Alert.alert('Thiếu địa điểm', 'Hãy chọn một địa điểm cho stop thủ công.');
      return;
    }

    const dayIndex = getDayIndexFromDate(manualStopDate, startDate);
    const { daysCount } = buildIsoDateRange(startDate, endDate);
    if (dayIndex === null || dayIndex >= daysCount) {
      Alert.alert('Ngày chưa hợp lệ', 'Ngày của stop phải nằm trong khoảng ngày đi của chuyến.');
      return;
    }

    const startTime = formatDateToHHmm(manualStopStartTime);
    const endTime = formatDateToHHmm(manualStopEndTime);
    const startMinutes = toMinutesFromHHmm(startTime);
    const endMinutes = toMinutesFromHHmm(endTime);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      Alert.alert('Giờ chưa hợp lệ', 'Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    const next: ManualStopDraft = {
      id: `${selectedManualPlace._id}-${Date.now()}`,
      placeId: selectedManualPlace._id,
      placeName: selectedManualPlace.name,
      thumbnail: selectedManualPlace.images?.[0],
      dayIndex,
      dayLabel: formatDateDisplay(manualStopDate),
      date: manualStopDate,
      startTime,
      endTime,
      estimatedCost: selectedManualPlace.estimated_cost_vnd,
    };

    setManualStops((prev) => [...prev, next]);
    closeManualStopModal();
  };

  const handleManualPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setManualPickerMode(null);
      return;
    }

    if (!selected || !manualPickerMode) {
      setManualPickerMode(null);
      return;
    }

    if (manualPickerMode === 'start-time') {
      setManualStopStartTime(selected);
      if (selected.getTime() >= manualStopEndTime.getTime()) {
        setManualStopEndTime(addMinutes(selected, 120));
      }
      setManualPickerMode(null);
      return;
    }

    setManualStopEndTime(selected);
    setManualPickerMode(null);
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
    const seedPlaceId = selectedPlaceIds.length ? selectedPlaceIds[selectedPlaceIds.length - 1] : undefined;

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
        seed_place_id: seedPlaceId,
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
        setSelectedPlaceIds((prev) => {
          if (!prev.length) return finalIds;

          const seen = new Set(prev);
          const merged = [...prev];
          for (const id of finalIds) {
            if (seen.has(id)) continue;
            merged.push(id);
            seen.add(id);
          }
          return merged;
        });
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
    if (currentStep !== 2 || planningMode !== 'ai') return;

    const timer = setTimeout(() => {
      fetchPlaces({ nextPage: 1, reset: true });
    }, placesSearch.trim() ? 320 : 0);

    return () => clearTimeout(timer);
  }, [currentStep, placesSearch, fetchPlaces, planningMode]);

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

  const manualStopDetails = useMemo(() => {
    if (!manualStops.length) return [];

    return manualStops.map((stop) => ({
      id: stop.id,
      name: stop.placeName,
      address: `${stop.date} | ${stop.startTime} - ${stop.endTime}`,
      category: 'MANUAL_STOP',
      estimatedCostVnd: stop.estimatedCost,
    }));
  }, [manualStops]);

  const formatCurrencyVnd = (value?: number) => {
    if (!value || value <= 0) return 'Chưa rõ chi phí';
    return `${value.toLocaleString('vi-VN')} đ`;
  };

  const validateStepOne = () => {
    const cleanName = tripName.trim();
    if (!cleanName) {
      Alert.alert('Thiếu thông tin', 'Bạn cần nhập tên chuyến đi trước khi sang bước tiếp theo.');
      return false;
    }

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
      setShowPlanningModeModal(true);
      return;
    }

    if (currentStep === 2) {
      if (planningMode === 'ai' && !selectedPlaceIds.length) {
        Alert.alert('Thiếu địa điểm', 'Bạn cần chọn ít nhất 1 địa điểm ở bước 2.');
        return;
      }

      if (planningMode === 'manual' && !manualStops.length) {
        Alert.alert('Thiếu stop', 'Bạn cần thêm ít nhất 1 stop thủ công ở bước 2.');
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

      const formatMinutesAsHHmm = (minutes: number) => {
        const safe = ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
        const hours = Math.floor(safe / 60);
        const mins = safe % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      };

      if (planningMode === 'manual' && manualStops.length) {
        const sortedManualStops = [...manualStops].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        });

        for (const stop of sortedManualStops) {
          const dayIndex = getDayIndexFromDate(stop.date, startDate);
          if (dayIndex === null || dayIndex >= normalizedJourneyDays) continue;

          await JourneyService.addStop(journeyId, {
            day_index: dayIndex,
            place_id: stop.placeId,
            start_time: stop.startTime,
            end_time: stop.endTime,
            estimated_cost: stop.estimatedCost || 0,
          });
        }
      }

      if (planningMode === 'ai' && !seededStops && selectedPlaceIds.length) {
        const dayStopCounts = new Map<number, number>();

        for (let i = 0; i < selectedPlaceIds.length; i += 1) {
          const placeId = selectedPlaceIds[i];
          const dayIndex = i % normalizedJourneyDays;
          const placedStopsForDay = dayStopCounts.get(dayIndex) || 0;
          const startMinutes = 8 * 60 + placedStopsForDay * 120;
          const endMinutes = startMinutes + 120;

          const relatedPlace = places.find((p) => p._id === placeId);
          await JourneyService.addStop(journeyId, {
            day_index: dayIndex,
            place_id: placeId,
            start_time: formatMinutesAsHHmm(startMinutes),
            end_time: formatMinutesAsHHmm(endMinutes),
            estimated_cost: relatedPlace?.estimated_cost_vnd || 0,
          });

          dayStopCounts.set(dayIndex, placedStopsForDay + 1);
        }
        setSeededStops(true);
      }

      if (planningMode === 'manual') {
        onJourneyCreated?.(journeyId);
        if (!onJourneyCreated) {
          Alert.alert('Thành công', 'Đã tạo hành trình với stop thủ công.');
          onClose?.();
        }
        return;
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
      ? 'Tiếp theo'
      : currentStep === 2
        ? 'Tiếp theo'
        : planningMode === 'manual'
          ? 'Tạo hành trình thủ công'
          : 'Bắt đầu tối ưu AI';

  const dateRangeSummary = `${startDate} -> ${endDate}`;
  const stepConfig = [
    { key: 1, label: 'THÔNG TIN', value: 1 },
    { key: 2, label: 'LẬP LỊCH', value: 2 },
    { key: 3, label: 'XÁC NHẬN', value: 3 },
  ];

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
            {stepConfig.map((step, index) => (
              <React.Fragment key={step.key}>
                <View className="items-center">
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: currentStep >= step.value ? '#2B8EF0' : 'transparent',
                      borderWidth: currentStep >= step.value ? 0 : 1.5,
                      borderColor: '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text className="text-[13px]" style={{ color: currentStep >= step.value ? 'white' : '#9CA3AF', fontWeight: '600' }}>
                      {step.key}
                    </Text>
                  </View>
                  <Text className="text-[10px] mt-1.5" style={{ color: currentStep >= step.value ? '#2B8EF0' : '#9CA3AF', fontWeight: '500' }}>
                    {step.label}
                  </Text>
                </View>

                {index < stepConfig.length - 1 ? (
                  <View
                    style={{
                      flex: 1,
                      height: 1.5,
                      backgroundColor: currentStep >= stepConfig[index + 1].value ? '#2B8EF0' : '#E5E7EB',
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

          {currentStep === 2 && planningMode === 'ai' ? (
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

          {currentStep === 2 && planningMode === 'manual' ? (
            <StepTwoManualStops
              manualStops={manualStops}
              onAddManualStop={openManualStopModal}
              onRemoveManualStop={(stopId) => setManualStops((prev) => prev.filter((stop) => stop.id !== stopId))}
            />
          ) : null}

          {currentStep === 3 ? (
            <StepThreeConfirm
              tripName={tripName}
              dateRangeSummary={dateRangeSummary}
              isSoloMode={isSoloMode}
              selectedMoodTitle={moodOptions.find((m) => m.id === selectedMood)?.title}
              budget={budget}
              selectedPlaces={planningMode === 'manual' ? manualStopDetails : selectedPlaceDetails}
              planningMode={planningMode}
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
            onPress={() => {
              setCurrentStep((prev) => (prev === 3 ? 2 : 1));
            }}
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

      {showDatePicker ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
        />
      ) : null}

      <Modal
        visible={showPlanningModeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlanningModeModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(17, 24, 39, 0.35)' }}>
          <View
            className="mx-5 rounded-2xl p-5"
            style={{ width: '92%', maxWidth: 420, backgroundColor: 'white' }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Chọn cách tạo lịch trình</Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: '#6B7280' }}>
              Bạn muốn dùng AI tối ưu chuyến đi hay tự thêm stop thủ công?
            </Text>

            <View style={{ marginTop: 16, flexDirection: 'row', gap: 10 }}>
              <Button
                onPress={() => {
                  setPlanningMode('ai');
                  setShowPlanningModeModal(false);
                  setCurrentStep(2);
                }}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: planningMode === 'ai' ? '#2B8EF0' : '#BFDBFE',
                  backgroundColor: '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 10,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#2B8EF0',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  <SparkleIcon />
                </View>
                <Text style={{ color: '#1D4ED8', fontWeight: '800', fontSize: 14, textAlign: 'center' }}>
                  Chuyến đi dùng AI
                </Text>
                <Text style={{ color: '#1D4ED8', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  AI tối ưu tự động
                </Text>
              </Button>

              <Button
                onPress={() => {
                  setPlanningMode('manual');
                  setShowPlanningModeModal(false);
                  setCurrentStep(2);
                }}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: planningMode === 'manual' ? '#16A34A' : '#BBF7D0',
                  backgroundColor: '#F0FDF4',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 10,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#22C55E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Path d="M4 6.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="white" strokeWidth="1.8" />
                    <Path d="M8 8h8M8 12h8M8 16h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </Svg>
                </View>
                <Text style={{ color: '#15803D', fontWeight: '800', fontSize: 14, textAlign: 'center' }}>
                  Tự thêm stop
                </Text>
                <Text style={{ color: '#15803D', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  Tùy chỉnh thủ công
                </Text>
              </Button>
            </View>

            <Button
              onPress={() => setShowPlanningModeModal(false)}
              className="items-center mt-3 py-2"
            >
              <Text style={{ color: '#6B7280', fontWeight: '600' }}>Để sau</Text>
            </Button>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showManualStopModal}
        transparent
        animationType="slide"
        onRequestClose={closeManualStopModal}
      >
        <View className="flex-1" style={{ backgroundColor: 'rgba(17, 24, 39, 0.35)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              maxHeight: '85%',
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            <View className="px-5 pt-4 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Thêm stop thủ công</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: '#6B7280' }}>Chọn địa điểm rồi đặt ngày giờ cụ thể cho stop.</Text>
            </View>

            <ScrollView className="px-5 pt-4" keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: '600' }}>Tìm địa điểm</Text>
              <View
                className="rounded-xl px-4"
                style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 48, justifyContent: 'center' }}
              >
                <TextInput
                  value={manualPlaceKeyword}
                  onChangeText={setManualPlaceKeyword}
                  placeholder="Nhập tên địa điểm"
                  placeholderTextColor="#9CA3AF"
                  style={{ color: '#111827', fontSize: 14, fontWeight: '500' }}
                />
              </View>

              {manualPlaceLoading ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#2B8EF0" />
                </View>
              ) : null}

              {manualPlaceResults.map((place) => {
                const isSelected = selectedManualPlace?._id === place._id;
                return (
                  <View key={place._id} style={{ marginTop: 10 }}>
                    <PlaceCard
                      place={place}
                      layout="horizontal"
                      onPress={() => setSelectedManualPlace(place)}
                      style={{
                        borderRadius: 14,
                        borderWidth: 1.4,
                        borderColor: isSelected ? '#2B8EF0' : '#E5E7EB',
                        backgroundColor: isSelected ? '#EFF6FF' : 'white',
                      }}
                    />

                    <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <CardContainer style={{ borderRadius: 999, borderColor: '#BBF7D0', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: '#166534', fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
                          {formatCurrencyVnd(place.estimated_cost_vnd)}
                        </Text>
                      </CardContainer>

                      {isSelected ? (
                        <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '700' }}>Đã chọn địa điểm này</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}

              <View className="mt-4" style={{ gap: 8 }}>
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>Ngày và giờ</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingVertical: 2, paddingRight: 8 }}
                >
                  {manualStopDayOptions.map((option) => (
                    <SelectableCard
                      key={option.dayIndex}
                      title={`Ngày ${option.dayIndex + 1}`}
                      subtitle={formatDateDisplay(option.date)}
                      selected={manualStopDayIndex === option.dayIndex}
                      onPress={() => {
                        setManualStopDayIndex(option.dayIndex);
                        setManualStopDate(option.date);
                      }}
                      backgroundColor={manualStopDayIndex === option.dayIndex ? '#EFF6FF' : 'white'}
                      containerStyle={{ width: 156, paddingVertical: 10, borderRadius: 12 }}
                    />
                  ))}
                </ScrollView>

                <View className="flex-row" style={{ gap: 8 }}>
                  <Button
                    onPress={() => setManualPickerMode('start-time')}
                    className="flex-1 px-4 py-3 rounded-xl"
                    style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' }}
                  >
                    <Text style={{ color: '#111827', fontWeight: '600' }}>Bắt đầu: {formatDateToHHmm(manualStopStartTime)}</Text>
                  </Button>

                  <Button
                    onPress={() => setManualPickerMode('end-time')}
                    className="flex-1 px-4 py-3 rounded-xl"
                    style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' }}
                  >
                    <Text style={{ color: '#111827', fontWeight: '600' }}>Kết thúc: {formatDateToHHmm(manualStopEndTime)}</Text>
                  </Button>
                </View>
              </View>

              <View style={{ height: 12 }} />
            </ScrollView>

            <View className="px-5 pt-3" style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
              <Button
                onPress={addManualStop}
                className="items-center py-3 rounded-xl"
                style={{ backgroundColor: '#DCFCE7' }}
              >
                <Text style={{ color: '#166534', fontWeight: '700' }}>Lưu stop thủ công</Text>
              </Button>

              <Button
                onPress={closeManualStopModal}
                className="items-center py-3"
              >
                <Text style={{ color: '#6B7280', fontWeight: '600' }}>Đóng</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {manualPickerMode ? (
        <DateTimePicker
          value={manualPickerMode === 'start-time' ? manualStopStartTime : manualStopEndTime}
          mode="time"
          display="default"
          onChange={handleManualPickerChange}
        />
      ) : null}
    </SafeAreaView>
  );
};
