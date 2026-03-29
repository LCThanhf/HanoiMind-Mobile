import { useCallback, useEffect, useMemo, useState } from 'react';
import { Journey, JourneyMemberRole, JourneyTag } from '../../services/journeyService/journey.type';
import { JourneyService } from '../../services/journeyService/journey.service';
import { PlacesService } from '../../services/placeService/place.service';
import { UsersService } from '../../services/userService/user.service';
import { DayItinerary, TripData } from './types';

export interface BudgetSummary {
  limit: number;
  planned: number;
  remaining: number;
}

export interface TripManageStop {
  id: string;
  placeId: string;
  title: string;
  address?: string;
  image?: string;
  rating?: number;
  lat?: number | null;
  lng?: number | null;
  estimatedCost: number;
  startTimeRaw?: string | null;
  endTimeRaw?: string | null;
  startTimeLabel: string;
  endTimeLabel?: string;
  durationLabel: string;
  status?: string;
}

export interface TripManageDay {
  dayId?: string;
  dayNumber: number;
  date?: string;
  stops: TripManageStop[];
}

interface UseTripDetailDataResult {
  isLoading: boolean;
  error: string | null;
  tripData: TripData | null;
  journey: Journey | null;
  budgetSummary: BudgetSummary;
  dayPlans: TripManageDay[];
  refresh: (options?: { silent?: boolean }) => Promise<void>;
}

interface TripDetailCacheSnapshot {
  tripData: TripData | null;
  journey: Journey | null;
  budgetSummary: BudgetSummary;
  dayPlans: TripManageDay[];
}

const tripDetailCache = new Map<string, TripDetailCacheSnapshot>();

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

const formatCompactCurrency = (value?: number) => {
  if (!value || Number.isNaN(value) || value <= 0) return '0 đ';
  return `${(value / 1000000).toFixed(1)} Tr`;
};

export const formatCurrencyVnd = (value?: number) => {
  const safe = Number(value || 0);
  return `${safe.toLocaleString('vi-VN')} VND`;
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

const DEFAULT_DAY_START_MINUTES = 8 * 60;
const DEFAULT_STOP_DURATION_MINUTES = 120;
const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const parseTimeToMinutes = (time?: string | null): number | null => {
  if (!time || typeof time !== 'string') return null;
  const trimmed = time.trim();
  if (!trimmed) return null;

  const hhmmMatch = trimmed.match(HHMM_REGEX);
  if (hhmmMatch) {
    const hours = Number(hhmmMatch[1]);
    const minutes = Number(hhmmMatch[2]);
    return hours * 60 + minutes;
  }

  const isoDate = new Date(trimmed);
  if (Number.isNaN(isoDate.getTime())) return null;
  return isoDate.getHours() * 60 + isoDate.getMinutes();
};

const formatMinutesAsHHmm = (value: number) => {
  const safe = ((Math.round(value) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const toDurationLabel = (startTime?: string | null, endTime?: string | null) => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return '2 giờ';

  const durationHours = (endMinutes - startMinutes) / 60;
  const rounded = Math.max(0.5, Math.round(durationHours * 2) / 2);
  if (Number.isInteger(rounded)) return `${rounded} giờ`;
  return `${String(rounded).replace('.', ',')} giờ`;
};

const formatTimeLabel = (time: string | null | undefined, fallbackOffsetMinutes: number) => {
  const parsedMinutes = parseTimeToMinutes(time);
  if (parsedMinutes !== null) {
    return formatMinutesAsHHmm(parsedMinutes);
  }

  return formatMinutesAsHHmm(DEFAULT_DAY_START_MINUTES + fallbackOffsetMinutes);
};

const toCoordinates = (place: any) => {
  const coords = place?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    return { lat: null, lng: null };
  }

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { lat: null, lng: null };
  }

  return { lat, lng };
};

const safeNameFromId = (id: string) => `User ${id.slice(-4).toUpperCase()}`;

const toBudgetSummary = (journey: Journey, rawBreakdown: any, totalStopsCost: number): BudgetSummary => {
  const fromBreakdownPlanned = Number(
    rawBreakdown?.total_planned || rawBreakdown?.planned_budget || rawBreakdown?.total_budget || 0
  );
  const fromBreakdownLimit = Number(rawBreakdown?.budget_limit || 0);

  const limitCandidate =
    fromBreakdownLimit ||
    Number((journey as any).budget_limit || (journey as any).budgetLimit || 0) ||
    Number(journey.total_budget || 0);

  const plannedCandidate = Math.max(fromBreakdownPlanned || 0, totalStopsCost);

  const remaining = limitCandidate > 0 ? Math.max(limitCandidate - plannedCandidate, 0) : 0;

  return {
    limit: Math.max(limitCandidate, plannedCandidate),
    planned: plannedCandidate,
    remaining,
  };
};

export const useTripDetailData = (tripId: string): UseTripDetailDataResult => {
  const cachedSnapshot = tripDetailCache.get(tripId);

  const [isLoading, setIsLoading] = useState(!cachedSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [tripData, setTripData] = useState<TripData | null>(cachedSnapshot?.tripData || null);
  const [journey, setJourney] = useState<Journey | null>(cachedSnapshot?.journey || null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>(
    cachedSnapshot?.budgetSummary || { limit: 0, planned: 0, remaining: 0 }
  );
  const [dayPlans, setDayPlans] = useState<TripManageDay[]>(cachedSnapshot?.dayPlans || []);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!tripId) return;

    try {
      const shouldShowBlockingLoader = !options?.silent && !tripData;
      if (shouldShowBlockingLoader) {
        setIsLoading(true);
      }

      setError(null);

      const [journeyResult, budgetResult, albumResult] = await Promise.allSettled([
        JourneyService.findOne(tripId),
        JourneyService.getBudgetBreakdown(tripId),
        JourneyService.getAlbum(tripId),
      ]);

      if (journeyResult.status !== 'fulfilled') {
        throw journeyResult.reason;
      }

      const loadedJourney = journeyResult.value;
      setJourney(loadedJourney);

      const stopIds = Array.from(
        new Set(
          (loadedJourney.days || [])
            .flatMap((day) => day.stops || [])
            .map((stop) => stop.place_id)
            .filter(Boolean)
        )
      );

      const placeMap = new Map<string, any>();
      if (stopIds.length) {
        const placeResults = await Promise.allSettled(stopIds.map((id) => PlacesService.findOne(id)));
        placeResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            placeMap.set(stopIds[index], result.value);
          }
        });
      }

      const memberIds = Array.from(
        new Set([loadedJourney.owner_id, ...(loadedJourney.members || []).map((member) => member.user_id)].filter(Boolean))
      );

      const profileResults = await Promise.allSettled(memberIds.map((id) => UsersService.getPublicProfile(id)));
      const profileMap = new Map<string, { name: string; avatar?: string }>();

      profileResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          profileMap.set(memberIds[index], {
            name: result.value.fullName,
            avatar: result.value.avatar,
          });
        }
      });

      const mappedMembers = (loadedJourney.members || []).map((member) => {
        const profile = profileMap.get(member.user_id);
        return {
          id: member.user_id,
          name: profile?.name || safeNameFromId(member.user_id),
          avatar: profile?.avatar,
          role: roleLabelMap[member.role] || member.role,
          joinedAt: member.joined_at,
          isOwner: member.user_id === loadedJourney.owner_id || member.role === JourneyMemberRole.HOST,
        };
      });

      if (!mappedMembers.some((member) => member.isOwner)) {
        const ownerProfile = profileMap.get(loadedJourney.owner_id);
        mappedMembers.unshift({
          id: loadedJourney.owner_id,
          name: ownerProfile?.name || safeNameFromId(loadedJourney.owner_id),
          avatar: ownerProfile?.avatar,
          role: 'Host',
          joinedAt: '',
          isOwner: true,
        });
      }

      const itinerary: DayItinerary[] = (loadedJourney.days || []).map((day) => ({
        day: day.day_number,
        title: `Lịch trình ngày ${day.day_number}`,
        date: day.date,
        activities: (day.stops || []).map((stop, index) => {
          const p = placeMap.get(stop.place_id);
          const pCost = p?.estimated_cost_vnd || p?.estimated_cost || 0;
          const sCost = stop.estimated_cost || pCost;

          return {
            id: stop._id,
            stopId: stop._id,
            placeId: stop.place_id,
            dayNumber: day.day_number,
            time: formatTimeLabel(stop.start_time, index * DEFAULT_STOP_DURATION_MINUTES),
            endTime: formatTimeLabel(stop.end_time, index * DEFAULT_STOP_DURATION_MINUTES + DEFAULT_STOP_DURATION_MINUTES),
            title: placeMap.get(stop.place_id)?.name || `Địa điểm ${index + 1}`,
            description: stop.note || `Chi phí dự kiến: ${sCost.toLocaleString('vi-VN')} đ`,
            status: stop.status,
            estimatedCost: sCost,
            image: placeMap.get(stop.place_id)?.images?.[0],
            address: placeMap.get(stop.place_id)?.address,
            rating: placeMap.get(stop.place_id)?.rating,
          };
        }),
      }));

      let totalStopsCost = 0;

      const builtDayPlans: TripManageDay[] = (loadedJourney.days || []).map((day) => ({
        dayId: day.id,
        dayNumber: day.day_number,
        date: day.date,
        stops: (day.stops || []).map((stop, index) => {
          const place = placeMap.get(stop.place_id);
          const { lat, lng } = toCoordinates(place);
          const placeCost = place?.estimated_cost_vnd || place?.estimated_cost || 0;
          const stopCost = stop.estimated_cost || placeCost;
          totalStopsCost += stopCost;

          return {
            id: stop._id,
            placeId: stop.place_id,
            title: place?.name || `Địa điểm ${index + 1}`,
            address: place?.address,
            image: place?.images?.[0],
            rating: place?.rating,
            lat,
            lng,
            estimatedCost: stopCost,
            startTimeRaw: stop.start_time,
            endTimeRaw: stop.end_time,
            startTimeLabel: formatTimeLabel(stop.start_time, index * DEFAULT_STOP_DURATION_MINUTES),
            endTimeLabel: formatTimeLabel(stop.end_time, index * DEFAULT_STOP_DURATION_MINUTES + DEFAULT_STOP_DURATION_MINUTES),
            durationLabel: toDurationLabel(stop.start_time, stop.end_time),
            status: stop.status,
          };
        }),
      }));

      const memberCount = Math.max(mappedMembers.length, loadedJourney.planned_members_count || 0, 1);
      const journeyTags = loadedJourney.tags && loadedJourney.tags.length ? loadedJourney.tags : [JourneyTag.CHILL];
      const moodVotes = journeyTags.map((tag, index) => {
        const mood = moodLabelMap[tag] || moodLabelMap[JourneyTag.CHILL]!;
        return {
          id: mood.id,
          title: mood.title,
          desc: mood.desc,
          votes: index === 0 ? memberCount : 0,
        };
      });

      const firstStop = (loadedJourney.days || []).flatMap((day) => day.stops || [])[0];
      const firstPlace = firstStop ? placeMap.get(firstStop.place_id) : undefined;
      const breakdown = budgetResult.status === 'fulfilled' ? budgetResult.value : null;
      const budget = toBudgetSummary(loadedJourney, breakdown, totalStopsCost);
      setBudgetSummary(budget);

      const albumCount =
        albumResult.status === 'fulfilled' && Array.isArray(albumResult.value) ? albumResult.value.length : 0;

      const nextTripData: TripData = {
        title: loadedJourney.name,
        location: firstPlace?.address || (firstPlace?.name ? `${firstPlace.name}, Việt Nam` : 'Việt Nam'),
        budget: formatCompactCurrency(budget.limit || budget.planned),
        days: `${getTripDurationDays(loadedJourney)} Ngày`,
        status: getTripStatus(loadedJourney),
        itinerary,
        members: mappedMembers,
        inviteCode: loadedJourney.invite_code,
        moodVotes,
      };

      if (albumCount > 0) {
        nextTripData.status = `${nextTripData.status} • ${albumCount} ảnh`;
      }

      tripDetailCache.set(tripId, {
        tripData: nextTripData,
        journey: loadedJourney,
        budgetSummary: budget,
        dayPlans: builtDayPlans,
      });

      setTripData(nextTripData);
      setDayPlans(builtDayPlans);
    } catch {
      setError('Không thể tải dữ liệu chuyến đi.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({ isLoading, error, tripData, journey, budgetSummary, dayPlans, refresh }),
    [isLoading, error, tripData, journey, budgetSummary, dayPlans, refresh]
  );
};