import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JourneyService } from '../services/journeyService/journey.service';
import { UpdateStopPayload } from '../services/journeyService/journey.type';
import { Button, ScreenHeader } from './shared';
import { MemberProfile, StopCostItem } from './tripBudget/types';
import { PayerDropdown } from './tripUpdateCost/PayerDropdown';
import { PaymentTypeSelector } from './tripUpdateCost/PaymentTypeSelector';
import { ParticipantsSelector } from './tripUpdateCost/ParticipantsSelector';
import { StopInfoCard } from './tripUpdateCost/StopInfoCard';

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
  const [actualCost, setActualCost] = useState(stop.actualCost ? String(stop.actualCost) : '');
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
      <ScreenHeader
        title="Cập nhật chi phí"
        onBack={onBack}
        showBorder
        titleWeight="700"
        titleSize={17}
      />

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
        <StopInfoCard stop={stop} />

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
        <PaymentTypeSelector isPrepaid={isPrepaid} onChange={setIsPrepaid} />
        <PayerDropdown
          actualCost={actualCost}
          setActualCost={setActualCost}
          perStopEstimated={perStopEstimated}
          payerUserId={payerUserId}
          setPayerUserId={setPayerUserId}
          showPayerDropdown={showPayerDropdown}
          setShowPayerDropdown={setShowPayerDropdown}
          members={members}
          selectedPayer={selectedPayer}
        />

        {/* ── 3. Share with whom ───────────────────────────────────────────── */}
        <ParticipantsSelector
          members={members}
          selectedParticipantIds={selectedParticipantIds}
          onToggle={toggleParticipant}
          perPersonEstimate={perPersonEstimate}
        />
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
