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
  placeCategory?: string;
  lat?: number | null;
  lng?: number | null;
  estimatedCost: number;
  actualCost?: number;
  checkinDayIndex?: number | null;
  checkinTime?: string | null;
  checkoutDayIndex?: number | null;
  checkoutTime?: string | null;
  isHotelStop?: boolean;
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
const parseTimeToMinutes = (time?: string | null): number | null => {
  if (!time || typeof time !== 'string') return null;
  const trimmed = time.trim();
  if (!trimmed) return null;

  // Cố gắng tìm HH:mm ở bất kỳ đâu trong chuỗi (ví dụ: '14:00', '14:00:00', 'T14:00', ' 14:00 ')
  const strictMatch = trimmed.match(/(?:^|\s|T)([01]?\d|2[0-3]):([0-5]\d)/);
  if (strictMatch) {
    const hours = Number(strictMatch[1]);
    const minutes = Number(strictMatch[2]);
    return hours * 60 + minutes;
  }

  // Backup cho các tình huống parse date
  const isoDate = new Date(trimmed);
  if (Number.isNaN(isoDate.getTime())) return null;

  // Rất hiếm khi vào luồng này nếu match ở trên đã xử lý toàn bộ định dạng chuẩn
  return isoDate.getHours() * 60 + isoDate.getMinutes();
};

const formatMinutesAsHHmm = (value: number) => {
  const safe = ((Math.round(value) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const toDayIndexNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }

  return null;
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

const resolveStopTimes = (
  startTimeRaw: string | null | undefined,
  endTimeRaw: string | null | undefined,
  fallbackOffsetMinutes: number
) => {
  let startMinutes = parseTimeToMinutes(startTimeRaw);
  let endMinutes = parseTimeToMinutes(endTimeRaw);

  if (startMinutes === null) {
    startMinutes = DEFAULT_DAY_START_MINUTES + fallbackOffsetMinutes;
  }

  if (endMinutes === null || endMinutes <= startMinutes) {
    endMinutes = startMinutes + DEFAULT_STOP_DURATION_MINUTES;
  }

  return {
    startTimeLabel: formatMinutesAsHHmm(startMinutes),
    endTimeLabel: formatMinutesAsHHmm(endMinutes),
  };
};

const toCoordinates = (place: any, stop?: any) => {
  const sources = [
    place?.location?.coordinates,
    stop?.place_snapshot?.location?.coordinates,
    stop?.location?.coordinates,
  ];

  for (const coords of sources) {
    if (Array.isArray(coords) && coords.length >= 2) {
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  const directLat = place?.lat ?? stop?.place_snapshot?.lat ?? stop?.lat;
  const directLng = place?.lng ?? stop?.place_snapshot?.lng ?? stop?.lng;

  if (directLat !== undefined && directLng !== undefined) {
    const lat = Number(directLat);
    const lng = Number(directLng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng };
    }
  }

  return { lat: null, lng: null };
};

const safeNameFromId = (id: string) => `User ${id.slice(-4).toUpperCase()}`;

const categoryWeight = (category?: string): number => {
  switch (String(category || '').toUpperCase()) {
    case 'HOTEL':
    case 'RESORT':
    case 'ACCOMMODATION':
      return 3.0;
    case 'HOSTEL':
    case 'HOMESTAY':
    case 'GUEST_HOUSE':
      return 2.0;
    case 'RESTAURANT':
    case 'BAR_PUB':
      return 1.2;
    case 'EXPERIENCE':
    case 'ENTERTAINMENT':
    case 'WELLNESS':
      return 1.3;
    case 'SHOPPING':
    case 'LOCAL_MARKET':
      return 1.5;
    case 'CAFE':
    case 'STREET_FOOD':
      return 0.8;
    case 'SIGHTSEEING':
    case 'CULTURE':
    case 'PARK':
      return 0.7;
    case 'TRANSPORT':
      return 0.5;
    case 'HEALTH':
    case 'FINANCE':
    case 'CONVENIENCE':
    case 'LAUNDRY':
      return 0.3;
    default:
      return 1.0;
  }
};

const toBudgetSummary = (journey: Journey, rawBreakdown: any, totalActualStopsCost: number): BudgetSummary => {
  const fromBreakdownActual = Number(
    rawBreakdown?.total_spent ||
      rawBreakdown?.actual_spent ||
      rawBreakdown?.total_actual ||
      rawBreakdown?.spent ||
      rawBreakdown?.total_fund_spent ||
      0
  );
  const fromJourneyActual = Number((journey as any)?.budget_analysis?.total_fund_spent || 0);
  const fromBreakdownLimit = Number(rawBreakdown?.budget_limit || 0);

  const limitCandidate =
    fromBreakdownLimit ||
    Number((journey as any).budget_limit || (journey as any).budgetLimit || 0) ||
    Number(journey.total_budget || 0);

  const actualCandidate = Math.max(fromBreakdownActual || 0, fromJourneyActual || 0, totalActualStopsCost || 0);
  const consumedBudget = actualCandidate;

  const remaining = limitCandidate > 0 ? Math.max(limitCandidate - consumedBudget, 0) : 0;

  return {
    limit: Math.max(limitCandidate, consumedBudget),
    planned: consumedBudget,
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

      const breakdown = budgetResult.status === 'fulfilled' ? budgetResult.value : null;
      const computedBudgetLimit =
        Number((breakdown as any)?.budget_limit || 0) ||
        Number((loadedJourney as any).budget_limit || (loadedJourney as any).budgetLimit || 0) ||
        Number(loadedJourney.total_budget || 0);

      const totalMembers = Math.max(memberIds.length, 1);
      const allJourneyStops = (loadedJourney.days || []).flatMap((day) => day.stops || []);
      const estimatedCostByStopId = new Map<string, number>();

      const estimationMeta = allJourneyStops.map((stop) => {
        const place = placeMap.get(stop.place_id);
        const rawEstimated = Number(stop.estimated_cost || 0);
        const rawActual = Number((stop as any).actual_cost || 0);

        if (rawActual > 0) {
          return {
            stopId: stop._id,
            hasEstimate: true,
            estimate: rawEstimated > 0 ? rawEstimated : rawActual,
            weight: 0,
          };
        }

        if (rawEstimated > 0) {
          return { stopId: stop._id, hasEstimate: true, estimate: rawEstimated, weight: 0 };
        }

        const placeEstimate = Number(place?.estimated_cost_vnd || place?.estimated_cost || 0);
        if (placeEstimate > 0) {
          const participantCount = Array.isArray((stop as any).participant_ids)
            ? (stop as any).participant_ids.length || totalMembers
            : totalMembers;
          const normalizedCostType = String((stop as any).cost_type || '').toUpperCase();
          const estimate = normalizedCostType === 'PER_PERSON' ? placeEstimate * participantCount : placeEstimate;
          return { stopId: stop._id, hasEstimate: true, estimate, weight: 0 };
        }

        return {
          stopId: stop._id,
          hasEstimate: false,
          estimate: 0,
          weight: categoryWeight(place?.category),
        };
      });

      estimationMeta.forEach((item) => {
        if (item.hasEstimate) {
          estimatedCostByStopId.set(item.stopId, item.estimate);
        }
      });

      const allocatedEstimate = estimationMeta
        .filter((item) => item.hasEstimate)
        .reduce((sum, item) => sum + item.estimate, 0);

      const remainingBudget = computedBudgetLimit > 0 ? Math.max(0, computedBudgetLimit - allocatedEstimate) : 0;
      const unresolved = estimationMeta.filter((item) => !item.hasEstimate);
      const totalWeight = unresolved.reduce((sum, item) => sum + item.weight, 0);

      unresolved.forEach((item) => {
        let estimate = 0;

        if (remainingBudget > 0 && totalWeight > 0) {
          estimate = Math.round((item.weight / totalWeight) * remainingBudget);
        } else if (computedBudgetLimit > 0 && allJourneyStops.length > 0) {
          estimate = Math.round(computedBudgetLimit / allJourneyStops.length);
        }

        estimatedCostByStopId.set(item.stopId, estimate);
      });

      const itinerary: DayItinerary[] = (loadedJourney.days || []).map((day) => ({
        day: day.day_number,
        title: `Lịch trình ngày ${day.day_number}`,
        date: day.date,
        activities: (day.stops || []).map((stop, index) => {
          const p = placeMap.get(stop.place_id);
          const pCost = p?.estimated_cost_vnd || p?.estimated_cost || 0;
          const sCost = estimatedCostByStopId.get(stop._id) ?? Number(stop.estimated_cost || pCost || 0);
          const times = resolveStopTimes(stop.start_time, stop.end_time, index * DEFAULT_STOP_DURATION_MINUTES);

          return {
            id: stop._id,
            stopId: stop._id,
            placeId: stop.place_id,
            dayNumber: day.day_number,
            time: times.startTimeLabel,
            endTime: times.endTimeLabel,
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

      let totalActualStopsCost = 0;

      const builtDayPlans: TripManageDay[] = (loadedJourney.days || []).map((day) => {
        const sortedStops = [...(day.stops || [])].sort((a, b) => {
          const seqA = typeof a.sequence === 'number' ? a.sequence : 999;
          const seqB = typeof b.sequence === 'number' ? b.sequence : 999;
          return seqA - seqB;
        });

        return {
          dayId: day.id,
          dayNumber: day.day_number,
          date: day.date,
          stops: sortedStops.map((stop, index) => {
            const place = placeMap.get(stop.place_id);
            const { lat, lng } = toCoordinates(place, stop);
            const placeCost = place?.estimated_cost_vnd || place?.estimated_cost || 0;
            const stopCost = estimatedCostByStopId.get(stop._id) ?? Number(stop.estimated_cost || placeCost || 0);
            const actualCost = Number((stop as any).actual_cost || 0);
            if (actualCost > 0) totalActualStopsCost += actualCost;
            const times = resolveStopTimes(stop.start_time, stop.end_time, index * DEFAULT_STOP_DURATION_MINUTES);
            const resolvedCategory =
              (typeof place?.category === 'string' && place.category) ||
              (typeof (stop as any).category === 'string' && (stop as any).category) ||
              '';
            const normalizedCategory = String(resolvedCategory || '').toUpperCase();
            const mappedTitle = place?.name || (stop as any).place_name || `Địa điểm ${index + 1}`;
            const normalizedTitle = mappedTitle.toUpperCase();
            const mappedCheckinDay = toDayIndexNumber((stop as any).checkin_day_index ?? (stop as any).checkinDayIndex);
            const mappedCheckoutDay = toDayIndexNumber((stop as any).checkout_day_index ?? (stop as any).checkoutDayIndex);
            const mappedCheckinTime = (stop as any).checkin_time || (stop as any).checkinTime || stop.start_time || null;
            const mappedCheckoutTime = (stop as any).checkout_time || (stop as any).checkoutTime || null;
            const hasHotelMeta = mappedCheckinDay !== null || mappedCheckoutDay !== null || !!mappedCheckoutTime;
            const hasHotelKeyword =
              normalizedTitle.includes('HOTEL') ||
              normalizedTitle.includes('RESORT') ||
              normalizedTitle.includes('HOSTEL') ||
              normalizedTitle.includes('HOMESTAY') ||
              normalizedTitle.includes('GUEST HOUSE') ||
              normalizedTitle.includes('KHACH SAN');

            return {
              id: stop._id,
              placeId: stop.place_id,
              title: mappedTitle,
              address: place?.address,
              image: place?.images?.[0],
              rating: place?.rating,
              placeCategory: resolvedCategory,
              lat,
              lng,
              estimatedCost: stopCost,
              actualCost: actualCost > 0 ? actualCost : undefined,
              checkinDayIndex: mappedCheckinDay,
              checkinTime: mappedCheckinTime,
              checkoutDayIndex: mappedCheckoutDay,
              checkoutTime: mappedCheckoutTime,
              isHotelStop:
                ['ACCOMMODATION', 'HOTEL', 'HOSTEL', 'HOMESTAY', 'RESORT', 'GUEST_HOUSE'].includes(normalizedCategory) ||
                hasHotelMeta ||
                hasHotelKeyword,
              startTimeRaw: stop.start_time,
              endTimeRaw: stop.end_time,
              startTimeLabel: times.startTimeLabel,
              endTimeLabel: times.endTimeLabel,
              durationLabel: toDurationLabel(stop.start_time, stop.end_time),
              status: stop.status,
            };
          }),
        };
      });

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
      const budget = toBudgetSummary(loadedJourney, breakdown, totalActualStopsCost);
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