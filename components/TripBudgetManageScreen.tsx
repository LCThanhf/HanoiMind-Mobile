import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { JourneyService } from '../services/journeyService/journey.service';
import {
  CostType,
  Journey,
  PayerDetail,
  UpdateStopPayload,
} from '../services/journeyService/journey.type';
import { PlacesService } from '../services/placeService/place.service';
import { UsersService } from '../services/userService/user.service';
import { AvatarCircle, Button, CardContainer, PillBadge, ScreenHeader } from './shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripBudgetManageScreenProps {
  tripId: string;
  onBack: () => void;
}

interface StopCostItem {
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
}

interface MemberProfile {
  userId: string;
  name: string;
  avatar?: string;
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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StopCostCardProps {
  stop: StopCostItem;
  onUpdatePress: () => void;
}

const StopCostCard = ({ stop, onUpdatePress }: StopCostCardProps) => {
  const isOverBudget =
    stop.actualCost !== undefined && stop.actualCost > stop.estimatedCost;

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
          <PillBadge
            label={stop.isPrepaid ? 'Đã trả trước' : 'Thanh toán sau'}
            backgroundColor={stop.isPrepaid ? '#DCFCE7' : '#EBF5FF'}
            textColor={stop.isPrepaid ? '#16A34A' : '#2B8EF0'}
            textSize={10}
            containerStyle={{ paddingHorizontal: 8, paddingVertical: 3 }}
          />
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
                backgroundColor: isOverBudget ? '#FEE2E2' : '#DCFCE7',
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isOverBudget ? '#DC2626' : '#16A34A',
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

// ─── Update Cost Modal ────────────────────────────────────────────────────────

interface UpdateCostModalProps {
  visible: boolean;
  stop: StopCostItem | null;
  members: MemberProfile[];
  actualCost: string;
  isPrepaid: boolean;
  payerUserId: string;
  isSaving: boolean;
  onChangeActualCost: (val: string) => void;
  onTogglePrepaid: (val: boolean) => void;
  onSelectPayer: (val: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const UpdateCostModal = ({
  visible,
  stop,
  members,
  actualCost,
  isPrepaid,
  payerUserId,
  isSaving,
  onChangeActualCost,
  onTogglePrepaid,
  onSelectPayer,
  onSave,
  onClose,
}: UpdateCostModalProps) => {
  if (!stop) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
          onPress={onClose}
        />

        {/* Sheet */}
        <View
          style={{
            marginTop: 'auto',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 36,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 36,
              height: 4,
              backgroundColor: '#E5E7EB',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          <Text style={{ fontSize: 17, color: '#111827', fontWeight: '700', marginBottom: 4 }}>
            Cập nhật chi phí
          </Text>
          <Text
            style={{ fontSize: 13, color: '#6B7280', fontWeight: '400', marginBottom: 20 }}
            numberOfLines={1}
          >
            {stop.placeName}
          </Text>

          {/* Payment status toggle */}
          <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 10 }}>
            Trạng thái thanh toán
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => onTogglePrepaid(false)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                marginRight: 6,
                borderWidth: 1.5,
                borderColor: !isPrepaid ? '#2B8EF0' : '#E5E7EB',
                backgroundColor: !isPrepaid ? '#EBF5FF' : 'white',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: !isPrepaid ? '#2B8EF0' : '#6B7280',
                  fontWeight: '600',
                }}
              >
                Thanh toán sau
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onTogglePrepaid(true)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                marginLeft: 6,
                borderWidth: 1.5,
                borderColor: isPrepaid ? '#22C55E' : '#E5E7EB',
                backgroundColor: isPrepaid ? '#DCFCE7' : 'white',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: isPrepaid ? '#16A34A' : '#6B7280',
                  fontWeight: '600',
                }}
              >
                Đã trả trước
              </Text>
            </TouchableOpacity>
          </View>

          {/* Actual cost input */}
          <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 10 }}>
            Chi phí thực tế (VND)
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 14,
              marginBottom: 20,
              height: 48,
              backgroundColor: '#F8FAFC',
            }}
          >
            <TextInput
              style={{ flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' }}
              placeholder={`Dự kiến: ${formatCost(stop.estimatedCost)}`}
              placeholderTextColor="#9CA3AF"
              value={actualCost}
              onChangeText={onChangeActualCost}
              keyboardType="numeric"
            />
            <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>đ</Text>
          </View>

          {/* Payer selection */}
          {members.length > 0 && (
            <>
              <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 10 }}>
                Người trả
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 24 }}
                contentContainerStyle={{ paddingRight: 4 }}
              >
                {members.map((member) => {
                  const isSelected = payerUserId === member.userId;
                  return (
                    <TouchableOpacity
                      key={member.userId}
                      onPress={() => onSelectPayer(isSelected ? '' : member.userId)}
                      activeOpacity={0.8}
                      style={{
                        alignItems: 'center',
                        marginRight: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: isSelected ? '#2B8EF0' : '#E5E7EB',
                        backgroundColor: isSelected ? '#EBF5FF' : 'white',
                        minWidth: 60,
                      }}
                    >
                      <AvatarCircle uri={member.avatar} name={member.name} size={32} />
                      <Text
                        style={{
                          fontSize: 11,
                          color: isSelected ? '#2B8EF0' : '#374151',
                          fontWeight: '600',
                          marginTop: 5,
                          textAlign: 'center',
                        }}
                        numberOfLines={1}
                      >
                        {member.name.split(' ').pop()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Button
            label="Lưu thay đổi"
            onPress={onSave}
            loading={isSaving}
            style={{ borderRadius: 12, minHeight: 50 }}
          />
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const TripBudgetManageScreen = ({ tripId, onBack }: TripBudgetManageScreenProps) => {
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [stops, setStops] = useState<StopCostItem[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Day filter
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  // Edit modal state
  const [editingStop, setEditingStop] = useState<StopCostItem | null>(null);
  const [modalActualCost, setModalActualCost] = useState('');
  const [modalIsPrepaid, setModalIsPrepaid] = useState(false);
  const [modalPayerUserId, setModalPayerUserId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const loadedJourney = await JourneyService.findOne(tripId);
      setJourney(loadedJourney);

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

      setMembers(
        memberIds.map((id) => ({
          userId: id,
          name: profileMap.get(id)?.name || `User ${id.slice(-4).toUpperCase()}`,
          avatar: profileMap.get(id)?.avatar,
        }))
      );

      // Build stop list with global sequence
      let seq = 1;
      const builtStops: StopCostItem[] = [];

      for (const day of loadedJourney.days || []) {
        for (const stop of day.stops || []) {
          const firstPayer: PayerDetail | undefined = (stop.payers || [])[0];
          const payerProfile = firstPayer ? profileMap.get(firstPayer.user_id) : undefined;

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
          });
        }
      }

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

  // Modal helpers
  const openEditModal = (stop: StopCostItem) => {
    setEditingStop(stop);
    setModalActualCost(stop.actualCost ? String(stop.actualCost) : '');
    setModalIsPrepaid(stop.isPrepaid);
    setModalPayerUserId(stop.payerUserId || '');
  };

  const closeEditModal = () => setEditingStop(null);

  const handleSaveUpdate = async () => {
    if (!editingStop) return;

    const rawValue = modalActualCost.replace(/[^0-9]/g, '');
    const parsedActual = rawValue ? parseInt(rawValue, 10) : undefined;

    const payload: UpdateStopPayload = {
      is_prepaid: modalIsPrepaid,
      actual_cost:
        parsedActual !== undefined && parsedActual > 0 ? parsedActual : undefined,
      payers: modalPayerUserId
        ? [
            {
              user_id: modalPayerUserId,
              amount_paid:
                parsedActual && parsedActual > 0
                  ? parsedActual
                  : editingStop.estimatedCost,
            },
          ]
        : undefined,
    };

    try {
      setIsSaving(true);
      await JourneyService.updateStop(
        tripId,
        editingStop.dayId,
        editingStop.stopId,
        payload
      );
      closeEditModal();
      await loadData();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật chi phí. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

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
        <Pressable style={{ flex: 1 }} onPress={() => setShowDayDropdown(false)}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
            keyboardShouldPersistTaps="handled"
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
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white',
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
                      top: 40,
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
                      minWidth: 130,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDay(null);
                        setShowDayDropdown(false);
                      }}
                      style={{ paddingHorizontal: 16, paddingVertical: 11 }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: selectedDay === null ? '#2B8EF0' : '#374151',
                          fontWeight: selectedDay === null ? '700' : '500',
                        }}
                      >
                        {selectedDay === null ? '✓ ' : ''}Tất cả ngày
                      </Text>
                    </TouchableOpacity>

                    {dayNumbers.map((day) => (
                      <TouchableOpacity
                        key={day}
                        onPress={() => {
                          setSelectedDay(day);
                          setShowDayDropdown(false);
                        }}
                        style={{ paddingHorizontal: 16, paddingVertical: 11 }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: selectedDay === day ? '#2B8EF0' : '#374151',
                            fontWeight: selectedDay === day ? '700' : '500',
                          }}
                        >
                          {selectedDay === day ? '✓ ' : ''}Ngày {day}
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
                    onUpdatePress={() => openEditModal(stop)}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </Pressable>
      )}

      {/* Update cost modal */}
      <UpdateCostModal
        visible={!!editingStop}
        stop={editingStop}
        members={members}
        actualCost={modalActualCost}
        isPrepaid={modalIsPrepaid}
        payerUserId={modalPayerUserId}
        isSaving={isSaving}
        onChangeActualCost={setModalActualCost}
        onTogglePrepaid={setModalIsPrepaid}
        onSelectPayer={setModalPayerUserId}
        onSave={handleSaveUpdate}
        onClose={closeEditModal}
      />
    </SafeAreaView>
  );
};
