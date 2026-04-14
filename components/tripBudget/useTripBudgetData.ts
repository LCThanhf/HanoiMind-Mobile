import { useCallback, useEffect, useMemo, useState } from 'react';
import { JourneyService } from '../../services/journeyService/journey.service';
import {
  CostType,
  Journey,
  JourneyMemberRole,
  PayerDetail,
} from '../../services/journeyService/journey.type';
import { PlacesService } from '../../services/placeService/place.service';
import { UsersService } from '../../services/userService/user.service';
import { MemberProfile, StopCostItem } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
  const sDay = s.getDate();
  const sMonth = s.getMonth() + 1;
  const eDay = e.getDate();
  const eMonth = e.getMonth() + 1;
  const year = e.getFullYear();
  if (sMonth === eMonth) {
    return `${sDay} - ${eDay} Tháng ${eMonth}, ${year}`;
  }
  return `${sDay} Tháng ${sMonth} - ${eDay} Tháng ${eMonth}, ${year}`;
};

/**
 * Weight multiplier per place category for budget distribution.
 * Higher = gets a larger share of the unallocated budget.
 */
const categoryWeight = (category?: string): number => {
  switch (category) {
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseTripBudgetDataResult {
  isLoading: boolean;
  loadError: string | null;
  journey: Journey | null;
  stops: StopCostItem[];
  members: MemberProfile[];
  perStopEstimated: number;
  filteredStops: StopCostItem[];
  dayNumbers: number[];
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  showDayDropdown: boolean;
  setShowDayDropdown: (show: boolean | ((prev: boolean) => boolean)) => void;
  selectedDayLabel: string;
  reload: () => void;
}

export const useTripBudgetData = (tripId: string): UseTripBudgetDataResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [stops, setStops] = useState<StopCostItem[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [perStopEstimated, setPerStopEstimated] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const [loadedJourney, rawBreakdown] = await Promise.all([
        JourneyService.findOne(tripId),
        JourneyService.getBudgetBreakdown(tripId).catch(() => null),
      ]);
      setJourney(loadedJourney);

      const computedLimit =
        Number(rawBreakdown?.budget_limit || 0) ||
        Number((loadedJourney as any).budget_limit || (loadedJourney as any).budgetLimit || 0) ||
        Number(loadedJourney.total_budget || 0);
      setBudgetLimit(computedLimit);

      const allDayStops = (loadedJourney.days || []).flatMap((day) =>
        (day.stops || []).map((stop) => ({ day, stop }))
      );
      const placeIds = Array.from(
        new Set(allDayStops.map(({ stop }) => stop.place_id).filter(Boolean))
      );

      const [placeResults, profileResults] = await Promise.all([
        Promise.allSettled(placeIds.map((id) => PlacesService.findOne(id))),
        Promise.allSettled(
          Array.from(
            new Set([
              loadedJourney.owner_id,
              ...(loadedJourney.members || []).map((m) => m.user_id),
            ].filter(Boolean))
          ).map((id) => UsersService.getPublicProfile(id).then((p) => ({ id, p })))
        ),
      ]);

      const placeMap = new Map<string, any>();
      placeResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') placeMap.set(placeIds[idx], result.value);
      });

      const profileMap = new Map<string, { name: string; avatar?: string }>();
      profileResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          profileMap.set(result.value.id, {
            name: result.value.p.fullName,
            avatar: result.value.p.avatar,
          });
        }
      });

      const memberIds = Array.from(
        new Set([
          loadedJourney.owner_id,
          ...(loadedJourney.members || []).map((m) => m.user_id),
        ].filter(Boolean))
      );

      const roleMap = new Map<string, JourneyMemberRole>();
      roleMap.set(loadedJourney.owner_id, JourneyMemberRole.HOST);
      (loadedJourney.members || []).forEach((m) => {
        if (!roleMap.has(m.user_id)) roleMap.set(m.user_id, m.role);
      });

      setMembers(
        memberIds.map((id) => ({
          userId: id,
          name: profileMap.get(id)?.name || `User ${id.slice(-4).toUpperCase()}`,
          avatar: profileMap.get(id)?.avatar,
          role: roleMap.get(id),
        }))
      );

      let seq = 1;
      const builtStops: StopCostItem[] = [];
      const rawStopMeta: Array<{
        estimated_cost: number;
        actual_cost: number;
        place_id: string;
        cost_type?: CostType;
        participant_ids?: string[];
      }> = [];

      for (const day of loadedJourney.days || []) {
        for (const stop of day.stops || []) {
          const firstPayer: PayerDetail | undefined = (stop.payers || [])[0];
          const payerProfile = firstPayer ? profileMap.get(firstPayer.user_id) : undefined;

          rawStopMeta.push({
            estimated_cost: stop.estimated_cost || 0,
            actual_cost: stop.actual_cost && stop.actual_cost > 0 ? stop.actual_cost : 0,
            place_id: stop.place_id,
            cost_type: stop.cost_type,
            participant_ids: stop.participant_ids,
          });

          builtStops.push({
            dayId: day.id,
            dayNumber: day.day_number,
            stopSequence: seq++,
            stopId: stop._id,
            placeId: stop.place_id,
            placeName: placeMap.get(stop.place_id)?.name || `Địa điểm ${seq - 1}`,
            estimatedCost: stop.estimated_cost || 0,
            actualCost: stop.actual_cost && stop.actual_cost > 0 ? stop.actual_cost : undefined,
            isPrepaid: stop.is_prepaid === true,
            costType: stop.cost_type || CostType.SHARED,
            payerUserId: firstPayer?.user_id,
            payerName:
              payerProfile?.name ||
              (firstPayer ? `User ${firstPayer.user_id.slice(-4).toUpperCase()}` : undefined),
            payerAvatar: payerProfile?.avatar,
            participantIds: stop.participant_ids || [],
          });
        }
      }

      // ── Smart per-stop cost estimation ──────────────────────────────────────
      // P0: actual cost known → lock estimate
      // P1: server estimated_cost → use directly
      // P2: place estimated_cost_vnd → scale for PER_PERSON
      // P3: category-weighted share of remaining budget
      const totalMembers = memberIds.length || 1;

      interface StopEstMeta {
        hasEstimate: boolean;
        estimate: number;
        weight: number;
      }
      const estMeta: StopEstMeta[] = rawStopMeta.map((raw) => {
        if (raw.actual_cost > 0) {
          return { hasEstimate: true, estimate: raw.estimated_cost > 0 ? raw.estimated_cost : raw.actual_cost, weight: 0 };
        }
        if (raw.estimated_cost > 0) {
          return { hasEstimate: true, estimate: raw.estimated_cost, weight: 0 };
        }
        const place = placeMap.get(raw.place_id);
        const placeEstimate: number = place?.estimated_cost_vnd || 0;
        if (placeEstimate > 0) {
          const participantCount = raw.participant_ids?.length || totalMembers;
          const estimate =
            raw.cost_type === CostType.PER_PERSON
              ? placeEstimate * participantCount
              : placeEstimate;
          return { hasEstimate: true, estimate, weight: 0 };
        }
        return { hasEstimate: false, estimate: 0, weight: categoryWeight(place?.category) };
      });

      estMeta.forEach((meta, i) => {
        if (meta.hasEstimate) builtStops[i].estimatedCost = meta.estimate;
      });

      const alreadyAllocated = estMeta
        .filter((m) => m.hasEstimate)
        .reduce((sum, m) => sum + m.estimate, 0);
      const remainingBudget = computedLimit > 0 ? Math.max(0, computedLimit - alreadyAllocated) : 0;
      const totalWeight = estMeta.reduce((sum, m) => sum + m.weight, 0);

      estMeta.forEach((meta, i) => {
        if (!meta.hasEstimate) {
          if (remainingBudget > 0 && totalWeight > 0) {
            builtStops[i].estimatedCost = Math.round((meta.weight / totalWeight) * remainingBudget);
          } else if (computedLimit > 0 && builtStops.length > 0) {
            builtStops[i].estimatedCost = Math.round(computedLimit / builtStops.length);
          }
        }
      });

      const avgEstimated =
        builtStops.length > 0
          ? Math.round(builtStops.reduce((sum, s) => sum + s.estimatedCost, 0) / builtStops.length)
          : 0;
      setPerStopEstimated(avgEstimated);
      setStops(builtStops);
    } catch {
      setLoadError('Không thể tải dữ liệu chi phí. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStops = useMemo(() => {
    if (selectedDay === null) return stops;
    return stops.filter((s) => s.dayNumber === selectedDay);
  }, [stops, selectedDay]);

  const dayNumbers = useMemo(
    () => (journey?.days || []).map((d) => d.day_number).sort((a, b) => a - b),
    [journey]
  );

  const selectedDayLabel = selectedDay === null ? 'Chọn ngày' : `Ngày ${selectedDay}`;

  return {
    isLoading,
    loadError,
    journey,
    stops,
    members,
    perStopEstimated,
    filteredStops,
    dayNumbers,
    selectedDay,
    setSelectedDay,
    showDayDropdown,
    setShowDayDropdown,
    selectedDayLabel,
    reload: loadData,
  };
};
