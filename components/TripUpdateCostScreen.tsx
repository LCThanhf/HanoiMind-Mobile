import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { JourneyService } from '../services/journeyService/journey.service';
import { CostType, JourneyMemberRole, UpdateStopPayload } from '../services/journeyService/journey.type';
import { AvatarCircle, Button, CardContainer, ScreenHeader } from './shared';
import { MemberProfile, StopCostItem } from './TripBudgetManageScreen';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCost = (value: number): string =>
  `${value.toLocaleString('vi-VN')} đ`;

const costTypeLabel = (type: CostType): string => {
  switch (type) {
    case CostType.SHARED:
      return 'Chia đều (Shared)';
    case CostType.PER_PERSON:
      return 'Mỗi người (Per person)';
    case CostType.CUSTOM:
      return 'Tùy chỉnh (Custom)';
    default:
      return type;
  }
};

const roleLabel = (role?: JourneyMemberRole): string => {
  if (role === JourneyMemberRole.HOST) return 'Trưởng nhóm';
  if (role === JourneyMemberRole.VIEWER) return 'Người xem';
  return 'Thành viên';
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TripUpdateCostScreenProps {
  tripId: string;
  stop: StopCostItem;
  members: MemberProfile[];
  perStopEstimated: number;
  onBack: () => void;
  onSaved: () => void;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const TripUpdateCostScreen = ({
  tripId,
  stop,
  members,
  perStopEstimated,
  onBack,
  onSaved,
}: TripUpdateCostScreenProps) => {
  const [isPrepaid, setIsPrepaid] = useState(stop.isPrepaid);
  const [actualCost, setActualCost] = useState(
    stop.actualCost ? String(stop.actualCost) : ''
  );
  const [payerUserId, setPayerUserId] = useState(stop.payerUserId || '');
  const [showPayerDropdown, setShowPayerDropdown] = useState(false);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    stop.participantIds && stop.participantIds.length > 0
      ? stop.participantIds
      : members.map((m) => m.userId)
  );
  const [isSaving, setIsSaving] = useState(false);

  const parsedActual = useMemo(() => {
    const raw = actualCost.replace(/[^0-9]/g, '');
    return raw ? parseInt(raw, 10) : 0;
  }, [actualCost]);

  const perPersonEstimate = useMemo(() => {
    if (!parsedActual || selectedParticipantIds.length === 0) return 0;
    return Math.round(parsedActual / selectedParticipantIds.length);
  }, [parsedActual, selectedParticipantIds]);

  const selectedPayer = members.find((m) => m.userId === payerUserId);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    const payload: UpdateStopPayload = {
      is_prepaid: isPrepaid,
      actual_cost: parsedActual > 0 ? parsedActual : undefined,
      participant_ids: selectedParticipantIds.length > 0 ? selectedParticipantIds : undefined,
      ...(perStopEstimated > 0 && { estimated_cost: perStopEstimated, is_manual_cost: false }),
      payers: payerUserId
        ? [
            {
              user_id: payerUserId,
              amount_paid: parsedActual > 0 ? parsedActual : stop.estimatedCost,
            },
          ]
        : undefined,
    };

    try {
      setIsSaving(true);
      await JourneyService.updateStop(tripId, stop.dayId, stop.stopId, payload);
      onSaved();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật chi phí. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top', 'bottom']}>
      {/* Header — centered title, back button */}
      <ScreenHeader
        title="Cập nhật chi phí"
        onBack={onBack}
        showBorder
        titleWeight="700"
        titleSize={17}
      />

      {/* Scrollable body */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => setShowPayerDropdown(false)}
      >
        {/* ── 1. Stop info ─────────────────────────────────────────────────── */}
        <Text
          style={{
            fontSize: 12,
            color: '#6B7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          Thông tin điểm dừng
        </Text>
        <CardContainer style={{ marginBottom: 20 }}>
          {/* Place name row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              paddingBottom: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#DCFCE7',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                flexShrink: 0,
              }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"
                  stroke="#16A34A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="11" r="2" stroke="#16A34A" strokeWidth="1.8" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 10,
                  color: '#9CA3AF',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 3,
                }}
              >
                Tên địa điểm
              </Text>
              <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>
                {stop.placeName}
              </Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

          {/* Cost type row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              paddingTop: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#EBF5FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                flexShrink: 0,
              }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  stroke="#2B8EF0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="9" cy="7" r="4" stroke="#2B8EF0" strokeWidth="1.8" />
                <Path
                  d="M23 21v-2a4 4 0 0 0-3-3.87"
                  stroke="#2B8EF0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M16 3.13a4 4 0 0 1 0 7.75"
                  stroke="#2B8EF0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 10,
                  color: '#9CA3AF',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 3,
                }}
              >
                Loại chi phí
              </Text>
              <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>
                {costTypeLabel(stop.costType)}
              </Text>
            </View>
          </View>
        </CardContainer>

        {/* ── 2. Payment detail ─────────────────────────────────────────────── */}
        <Text
          style={{
            fontSize: 12,
            color: '#6B7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          Chi tiết thanh toán
        </Text>

        {/* Đã trả trước option */}
        <TouchableOpacity
          onPress={() => setIsPrepaid(true)}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: isPrepaid ? '#22C55E' : '#E5E7EB',
            backgroundColor: isPrepaid ? '#DCFCE7' : 'white',
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: isPrepaid ? '#22C55E' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="12"
                r="10"
                stroke={isPrepaid ? 'white' : '#9CA3AF'}
                strokeWidth="2"
              />
              <Path
                d="M9 12l2 2 4-4"
                stroke={isPrepaid ? 'white' : '#9CA3AF'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                color: isPrepaid ? '#16A34A' : '#374151',
                fontWeight: '700',
                marginBottom: 2,
              }}
            >
              Đã trả trước
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: isPrepaid ? '#16A34A' : '#6B7280',
                fontWeight: '400',
              }}
            >
              Chi phí đã được thanh toán trước đó
            </Text>
          </View>
        </TouchableOpacity>

        {/* Thanh toán sau option */}
        <TouchableOpacity
          onPress={() => setIsPrepaid(false)}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: !isPrepaid ? '#2B8EF0' : '#E5E7EB',
            backgroundColor: !isPrepaid ? '#EBF5FF' : 'white',
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: !isPrepaid ? '#2B8EF0' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="12"
                r="10"
                stroke={!isPrepaid ? 'white' : '#9CA3AF'}
                strokeWidth="2"
              />
              <Path
                d="M12 8v4l3 3"
                stroke={!isPrepaid ? 'white' : '#9CA3AF'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                color: !isPrepaid ? '#2B8EF0' : '#374151',
                fontWeight: '700',
                marginBottom: 2,
              }}
            >
              Thanh toán sau
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: !isPrepaid ? '#2B8EF0' : '#6B7280',
                fontWeight: '400',
              }}
            >
              Chi phí được thanh toán sau khi tới điểm dừng
            </Text>
          </View>
        </TouchableOpacity>

        {/* Actual cost input */}
        <Text
          style={{
            fontSize: 13,
            color: '#374151',
            fontWeight: '600',
            marginBottom: 8,
          }}
        >
          Số tiền thực tế (VNĐ)
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            paddingHorizontal: 14,
            height: 52,
            backgroundColor: 'white',
            marginBottom: 16,
          }}
        >
          <Svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 10 }}
          >
            <Path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <TextInput
            style={{ flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' }}
            placeholder={
              perStopEstimated > 0
                ? `Dự kiến: ${formatCost(perStopEstimated)}`
                : 'Nhập số tiền'
            }
            placeholderTextColor="#9CA3AF"
            value={actualCost}
            onChangeText={setActualCost}
            keyboardType="numeric"
          />
        </View>

        {/* Payer dropdown */}
        <Text
          style={{
            fontSize: 13,
            color: '#374151',
            fontWeight: '600',
            marginBottom: 8,
          }}
        >
          Người chi trả
        </Text>
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setShowPayerDropdown((prev) => !prev)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 14,
              height: 52,
              backgroundColor: 'white',
            }}
          >
            {selectedPayer ? (
              <>
                <AvatarCircle uri={selectedPayer.avatar} name={selectedPayer.name} size={32} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: '#111827',
                    fontWeight: '500',
                    marginLeft: 10,
                  }}
                >
                  {selectedPayer.name}
                </Text>
              </>
            ) : (
              <>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle cx="12" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" />
                  </Svg>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: '#9CA3AF',
                    fontWeight: '400',
                    marginLeft: 10,
                  }}
                >
                  Chọn người chi trả
                </Text>
              </>
            )}
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d={showPayerDropdown ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {showPayerDropdown && (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#0F172A',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
                marginTop: 4,
              }}
            >
              {/* Clear selection row */}
              <TouchableOpacity
                onPress={() => {
                  setPayerUserId('');
                  setShowPayerDropdown(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '500' }}>
                  Bỏ chọn
                </Text>
              </TouchableOpacity>

              {members.map((member) => (
                <TouchableOpacity
                  key={member.userId}
                  onPress={() => {
                    setPayerUserId(member.userId);
                    setShowPayerDropdown(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                  }}
                >
                  <AvatarCircle uri={member.avatar} name={member.name} size={32} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}
                      numberOfLines={1}
                    >
                      {member.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '400' }}>
                      {roleLabel(member.role)}
                    </Text>
                  </View>
                  {payerUserId === member.userId && (
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17l-5-5"
                        stroke="#22C55E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── 3. Share with whom ───────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: 6 }}
            >
              <Path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="#374151"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="9" cy="7" r="4" stroke="#374151" strokeWidth="1.8" />
              <Path
                d="M23 21v-2a4 4 0 0 0-3-3.87"
                stroke="#374151"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M16 3.13a4 4 0 0 1 0 7.75"
                stroke="#374151"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={{ fontSize: 13, color: '#374151', fontWeight: '700' }}>
              Chia cho ai?
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: '#EBF5FF',
            }}
          >
            <Text style={{ fontSize: 12, color: '#2B8EF0', fontWeight: '700' }}>
              {selectedParticipantIds.length}/{members.length}
            </Text>
          </View>
        </View>

        <CardContainer>
          {members.map((member, idx) => {
            const isSelected = selectedParticipantIds.includes(member.userId);
            return (
              <React.Fragment key={member.userId}>
                {idx > 0 && (
                  <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />
                )}
                <TouchableOpacity
                  onPress={() => toggleParticipant(member.userId)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <AvatarCircle uri={member.avatar} name={member.name} size={40} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}
                      numberOfLines={1}
                    >
                      {member.name}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: '#6B7280', fontWeight: '400' }}
                    >
                      {roleLabel(member.role)}
                    </Text>
                  </View>
                  {/* Checkbox */}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: isSelected ? '#22C55E' : '#D1D5DB',
                      backgroundColor: isSelected ? '#22C55E' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </CardContainer>

        {/* Per-person estimate hint */}
        {perPersonEstimate > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginTop: 12,
              paddingHorizontal: 4,
            }}
          >
            <Svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: 6, marginTop: 2 }}
            >
              <Circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2" />
              <Path
                d="M12 16v-4M12 8h.01"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
            <Text
              style={{
                flex: 1,
                fontSize: 12,
                color: '#6B7280',
                fontWeight: '400',
                lineHeight: 18,
              }}
            >
              Số tiền dự kiến cho mỗi người sẽ là{' '}
              <Text style={{ fontWeight: '700', color: '#374151' }}>
                {formatCost(perPersonEstimate)}
              </Text>{' '}
              dựa trên lựa chọn hiện tại.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed bottom actions */}
      <View
        style={{
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 16,
        }}
      >
        {isSaving ? (
          <View
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: '#22C55E',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <ActivityIndicator color="white" />
          </View>
        ) : (
          <Button
            label="Lưu thay đổi"
            onPress={handleSave}
            style={{
              borderRadius: 14,
              height: 52,
              backgroundColor: '#22C55E',
              marginBottom: 10,
            }}
          />
        )}
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{ alignItems: 'center', paddingVertical: 10 }}
        >
          <Text style={{ fontSize: 15, color: '#6B7280', fontWeight: '600' }}>Hủy bỏ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
