import React from 'react';
import { Text, View } from 'react-native';

import { Button, SectionHeader } from '../shared';
import { TripStopCard } from '../tripDetail/TripStopCard';
import { TripManageStop } from '../tripDetail/useTripDetailData';
import { ManualStopDraft } from './types';

interface StepTwoManualStopsProps {
  manualStops: ManualStopDraft[];
  onAddManualStop: () => void;
  onRemoveManualStop: (stopId: string) => void;
}

const toMinutes = (value: string) => {
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const toDurationLabel = (startTime: string, endTime: string) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start === null || end === null || end <= start) return '2 giờ';
  const hours = (end - start) / 60;
  const rounded = Math.max(0.5, Math.round(hours * 2) / 2);
  return Number.isInteger(rounded) ? `${rounded} giờ` : `${String(rounded).replace('.', ',')} giờ`;
};

const toTripManageStop = (stop: ManualStopDraft): TripManageStop => ({
  id: stop.id,
  placeId: stop.placeId,
  title: stop.placeName,
  address: stop.dayLabel || stop.date,
  image: stop.thumbnail,
  estimatedCost: stop.estimatedCost || 0,
  startTimeRaw: stop.startTime,
  endTimeRaw: stop.endTime,
  startTimeLabel: stop.startTime,
  endTimeLabel: stop.endTime,
  durationLabel: toDurationLabel(stop.startTime, stop.endTime),
});

export const StepTwoManualStops = ({
  manualStops,
  onAddManualStop,
  onRemoveManualStop,
}: StepTwoManualStopsProps) => (
  <View className="px-5 mb-6">
    <SectionHeader
      title="Lịch trình thủ công"
      paddingHorizontal={0}
      paddingTop={0}
      paddingBottom={0}
      marginBottom={12}
    />

    <Text style={{ marginBottom: 10, fontSize: 12, color: '#6B7280' }}>
      Thêm các điểm dừng giống cách bạn quản lý trong màn chi tiết lịch trình.
    </Text>

    {manualStops.length ? (
      <View style={{ marginBottom: 6 }}>
        {manualStops.map((stop, index) => (
          <View key={stop.id}>
            <TripStopCard
              stop={toTripManageStop(stop)}
              moodLabel={stop.dayLabel || stop.date}
              onDelete={() => onRemoveManualStop(stop.id)}
              onEditTime={() => undefined}
              onPress={() => undefined}
              deleting={false}
              showConnector={index < manualStops.length - 1}
            />
          </View>
        ))}
      </View>
    ) : (
      <Text style={{ marginBottom: 10, fontSize: 12, color: '#6B7280' }}>
        Chưa có stop thủ công. Hãy thêm ít nhất 1 stop để tiếp tục.
      </Text>
    )}

    <Button
      onPress={onAddManualStop}
      className="items-center py-3 rounded-xl"
      style={{ backgroundColor: '#DCFCE7' }}
    >
      <Text style={{ color: '#166534', fontWeight: '700' }}>+ Thêm stop thủ công</Text>
    </Button>
  </View>
);
