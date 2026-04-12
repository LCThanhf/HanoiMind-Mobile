import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { JourneyService } from '../../../services/journeyService/journey.service';
import {
  CostType,
  Journey,
  JourneyMemberRole,
  PayerDetail,
} from '../../../services/journeyService/journey.type';
import { PlacesService } from '../../../services/placeService/place.service';
import { UsersService } from '../../../services/userService/user.service';
import { AvatarCircle, Button, CardContainer, ScreenHeader } from '../../shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripBudgetManageScreenProps {
  tripId: string;
  onBack: () => void;
  onUpdateStop: (stop: StopCostItem, members: MemberProfile[], perStopEstimated: number) => void;
}

export interface StopCostItem {
  dayId: string;
  dayNumber: number;
  stopSequence: number;
  stopId: string;
  placeId: string;
  placeName: string;
  estimatedCost: number;
  actualCost?: number;
  isPrepaid: boolean;
  costType: CostType;
  payerUserId?: string;
  payerName?: string;
  payerAvatar?: string;
  participantIds: string[];
}

export interface MemberProfile {
  userId: string;
  name: string;
  avatar?: string;
  role?: JourneyMemberRole;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateRange = (start: string, end: string): string => {
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

const formatCost = (value: number): string =>
  `${value.toLocaleString('vi-VN')} đ`;

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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StopCostCardProps {
  stop: StopCostItem;
  onUpdatePress: () => void;
}

const StopCostCard = ({ stop, onUpdatePress }: StopCostCardProps) => {
  const isUnderPaid =
    stop.actualCost !== undefined && stop.actualCost < stop.estimatedCost;

  return (
    <CardContainer style={{ marginBottom: 12 }}>
      {/* Header: place name + status badge */}
      <View style={{ padding: 14, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6, flexShrink: 0 }}>
              <Path
                d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"
                stroke="#22C55E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="12" cy="11" r="2" stroke="#22C55E" strokeWidth="1.8" />
            </Svg>
            <Text
              style={{ fontSize: 15, color: '#111827', fontWeight: '700', flex: 1 }}
            >
              {stop.placeName}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
              backgroundColor: stop.isPrepaid ? '#DCFCE7' : '#EBF5FF',
            }}
          >
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
              <Circle cx="12" cy="12" r="10" stroke={stop.isPrepaid ? '#16A34A' : '#2B8EF0'} strokeWidth="2.2" />
              <Path
                d={stop.isPrepaid ? 'M9 12l2 2 4-4' : 'M12 8v4l3 3'}
                stroke={stop.isPrepaid ? '#16A34A' : '#2B8EF0'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={{ fontSize: 10, color: stop.isPrepaid ? '#16A34A' : '#2B8EF0', fontWeight: '600' }}>
              {stop.isPrepaid ? 'Đã trả trước' : 'Thanh toán sau'}
            </Text>
          </View>
        </View>

        <Text
          style={{ fontSize: 12, color: '#6B7280', fontWeight: '400', marginBottom: 8, marginLeft: 27 }}
        >
          Điểm dừng số {stop.stopSequence}
        </Text>

        {stop.costType === CostType.SHARED && (
          <View style={{ marginLeft: 22 }}>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: '#EBF5FF',
              }}
            >
              <Text style={{ fontSize: 11, color: '#2B8EF0', fontWeight: '500' }}>
                Chia đều nhóm
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

      {/* Cost comparison row */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 }}>
            Dự kiến
          </Text>
          <Text style={{ fontSize: 15, color: '#374151', fontWeight: '600' }}>
            {formatCost(stop.estimatedCost)}
          </Text>
        </View>

        <View style={{ width: 1, backgroundColor: '#F3F4F6' }} />

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 }}>
            Thực tế
          </Text>
          {stop.actualCost !== undefined ? (
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: isUnderPaid ? '#FEE2E2' : '#DCFCE7',
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isUnderPaid ? '#DC2626' : '#16A34A',
                  fontWeight: '700',
                }}
              >
                {formatCost(stop.actualCost)}
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '400', fontStyle: 'italic' }}>
              Chưa cập nhật
            </Text>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

      {/* Payer + update action */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
          {stop.payerName ? (
            <>
              <AvatarCircle uri={stop.payerAvatar} name={stop.payerName} size={28} />
              <View style={{ marginLeft: 8 }}>
                <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '400' }}>Người trả</Text>
                <Text
                  style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}
                  numberOfLines={1}
                >
                  {stop.payerName}
                </Text>
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '400', fontStyle: 'italic' }}>
              Chưa có người trả
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onUpdatePress}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 13, color: '#2B8EF0', fontWeight: '600' }}>
            Cập nhật chi phí
          </Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
            <Path
              d="M9 18l6-6-6-6"
              stroke="#2B8EF0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </CardContainer>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const TripBudgetManageScreen = ({ tripId, onBack, onUpdateStop }: TripBudgetManageScreenProps) => {
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [stops, setStops] = useState<StopCostItem[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [perStopEstimated, setPerStopEstimated] = useState(0);

  // Day filter
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

      // Derive budget limit (same logic as useTripDetailData.toBudgetSummary)
      const computedLimit =
        Number(rawBreakdown?.budget_limit || 0) ||
        Number((loadedJourney as any).budget_limit || (loadedJourney as any).budgetLimit || 0) ||
        Number(loadedJourney.total_budget || 0);
      setBudgetLimit(computedLimit);

      // Collect unique place IDs
      const allDayStops = (loadedJourney.days || []).flatMap((day) =>
        (day.stops || []).map((stop) => ({ day, stop }))
      );
      const placeIds = Array.from(
        new Set(allDayStops.map(({ stop }) => stop.place_id).filter(Boolean))
      );

      // Fetch places & member profiles in parallel
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

      // Build role map: owner → HOST, others from members array
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

      // Build stop list with global sequence
      let seq = 1;
      const builtStops: StopCostItem[] = [];
      // Parallel array tracking raw stop data needed for smart cost estimation
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
            placeName:
              placeMap.get(stop.place_id)?.name || `Địa điểm ${seq - 1}`,
            estimatedCost: stop.estimated_cost || 0,
            actualCost:
              stop.actual_cost && stop.actual_cost > 0 ? stop.actual_cost : undefined,
            isPrepaid: stop.is_prepaid === true,
            costType: stop.cost_type || CostType.SHARED,
            payerUserId: firstPayer?.user_id,
            payerName:
              payerProfile?.name ||
              (firstPayer
                ? `User ${firstPayer.user_id.slice(-4).toUpperCase()}`
                : undefined),
            payerAvatar: payerProfile?.avatar,
            participantIds: stop.participant_ids || [],
          });
        }
      }

      // ── Smart per-stop cost estimation ──────────────────────────────────────
      // Priority 1: stop already has estimated_cost from API / AI planning
      // Priority 2: place has its own estimated_cost_vnd (scaled for PER_PERSON)
      // Priority 3: category-weighted proportional share of remaining budget
      const totalMembers = memberIds.length || 1;

      interface StopEstMeta {
        hasEstimate: boolean;
        estimate: number;
        weight: number;
      }
      const estMeta: StopEstMeta[] = rawStopMeta.map((raw) => {
        // P0: already settled – actual cost is known, lock the estimate so adding
        // new stops never shifts a previously-confirmed expected value.
        if (raw.actual_cost > 0) {
          // Prefer the server-saved estimated_cost; fall back to actual_cost itself.
          return { hasEstimate: true, estimate: raw.estimated_cost > 0 ? raw.estimated_cost : raw.actual_cost, weight: 0 };
        }
        // P1
        if (raw.estimated_cost > 0) {
          return { hasEstimate: true, estimate: raw.estimated_cost, weight: 0 };
        }
        // P2
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
        // P3 – needs weighted budget share
        return {
          hasEstimate: false,
          estimate: 0,
          weight: categoryWeight(place?.category),
        };
      });

      // Apply P1 & P2 estimates
      estMeta.forEach((meta, i) => {
        if (meta.hasEstimate) builtStops[i].estimatedCost = meta.estimate;
      });

      // Distribute remaining budget to P3 stops
      const alreadyAllocated = estMeta
        .filter((m) => m.hasEstimate)
        .reduce((sum, m) => sum + m.estimate, 0);
      const remainingBudget =
        computedLimit > 0 ? Math.max(0, computedLimit - alreadyAllocated) : 0;
      const totalWeight = estMeta.reduce((sum, m) => sum + m.weight, 0);

      estMeta.forEach((meta, i) => {
        if (!meta.hasEstimate) {
          if (remainingBudget > 0 && totalWeight > 0) {
            builtStops[i].estimatedCost = Math.round(
              (meta.weight / totalWeight) * remainingBudget
            );
          } else if (computedLimit > 0 && builtStops.length > 0) {
            // ultimate fallback: even split
            builtStops[i].estimatedCost = Math.round(computedLimit / builtStops.length);
          }
        }
      });

      // perStopEstimated = average (used as placeholder in the edit screen)
      const avgEstimated =
        builtStops.length > 0
          ? Math.round(
              builtStops.reduce((sum, s) => sum + s.estimatedCost, 0) / builtStops.length
            )
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

  // Filtered stops by selected day
  const filteredStops = useMemo(() => {
    if (selectedDay === null) return stops;
    return stops.filter((s) => s.dayNumber === selectedDay);
  }, [stops, selectedDay]);

  const dayNumbers = useMemo(
    () =>
      (journey?.days || []).map((d) => d.day_number).sort((a, b) => a - b),
    [journey]
  );

  const selectedDayLabel =
    selectedDay === null ? 'Chọn ngày' : `Ngày ${selectedDay}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
      {/* Header */}
      <ScreenHeader title="Quản lý chi phí" onBack={onBack} showBorder />

      {/* Trip sub-header */}
      {journey && (
        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text
                style={{ fontSize: 16, color: '#111827', fontWeight: '700' }}
                numberOfLines={1}
              >
                {journey.name}
              </Text>
              <Text
                style={{ fontSize: 12, color: '#6B7280', marginTop: 3, fontWeight: '400' }}
              >
                {formatDateRange(journey.start_date, journey.end_date)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 10,
                  color: '#6B7280',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                Tổng điểm dừng
              </Text>
              <Text style={{ fontSize: 18, color: '#2B8EF0', fontWeight: '700' }}>
                {stops.length} điểm
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Body */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2B8EF0" />
        </View>
      ) : loadError ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: '#EF4444',
              fontWeight: '500',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {loadError}
          </Text>
          <Button label="Thử lại" onPress={loadData} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => setShowDayDropdown(false)}
          >
            {/* Section header + day filter */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 14,
              }}
            >
              <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>
                Chi tiết điểm dừng
              </Text>

              {/* Day dropdown */}
              <View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowDayDropdown((prev) => !prev);
                  }}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white',
                    minWidth: 130,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#374151',
                      fontWeight: '600',
                      marginRight: 5,
                    }}
                  >
                    {selectedDayLabel}
                  </Text>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 9l6 6 6-6"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>

                {showDayDropdown && (
                  <View
                    style={{
                      position: 'absolute',
                      top: '105%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      shadowColor: '#0F172A',
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 8,
                      zIndex: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDay(null);
                        setShowDayDropdown(false);
                      }}
                      style={{ paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View style={{ width: 18, marginRight: 6, alignItems: 'center' }}>
                        {selectedDay === null && (
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M5 13l4 4L19 7"
                              stroke="#2B8EF0"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: selectedDay === null ? '#2B8EF0' : '#374151',
                          fontWeight: selectedDay === null ? '700' : '500',
                        }}
                      >
                        Tất cả ngày
                      </Text>
                    </TouchableOpacity>

                    {dayNumbers.map((day) => (
                      <TouchableOpacity
                        key={day}
                        onPress={() => {
                          setSelectedDay(day);
                          setShowDayDropdown(false);
                        }}
                        style={{ paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center' }}
                      >
                        <View style={{ width: 18, marginRight: 6, alignItems: 'center' }}>
                          {selectedDay === day && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M5 13l4 4L19 7"
                                stroke="#2B8EF0"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 13,
                            color: selectedDay === day ? '#2B8EF0' : '#374151',
                            fontWeight: selectedDay === day ? '700' : '500',
                          }}
                        >
                          Ngày {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Stop cards */}
            <View style={{ paddingHorizontal: 20 }}>
              {filteredStops.length === 0 ? (
                <CardContainer style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '500' }}>
                    Không có điểm dừng nào.
                  </Text>
                </CardContainer>
              ) : (
                filteredStops.map((stop) => (
                  <StopCostCard
                    key={stop.stopId}
                    stop={stop}
                    onUpdatePress={() => onUpdateStop(stop, members, perStopEstimated)}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};
