import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { TripManageStop } from './useTripDetailData';
import { Button } from '../shared';

interface TripStopCardProps {
  stop: TripManageStop;
  moodLabel: string;
  onDelete: () => void;
  onEditTime: () => void;
  onPress: () => void;
  deleting: boolean;
  showConnector: boolean;
}

const formatCostLabel = (cost: number, isActual: boolean) => {
  if (!cost || cost <= 0) return isActual ? '0 VND' : '~Miễn phí';
  return isActual ? `${cost.toLocaleString('vi-VN')} VND` : `~${cost.toLocaleString('vi-VN')} VND`;
};

export const TripStopCard = ({ stop, moodLabel, onDelete, onEditTime, onPress, deleting, showConnector }: TripStopCardProps) => {
  const hasHotelStayInfo = stop.isHotelStop && !!stop.checkoutTime;
  const hasActualCost = typeof stop.actualCost === 'number' && stop.actualCost > 0;
  const displayedCost = hasActualCost ? stop.actualCost || 0 : stop.estimatedCost;
  const checkinDayLabel = typeof stop.checkinDayIndex === 'number' ? stop.checkinDayIndex + 1 : null;
  const checkoutDayLabel = typeof stop.checkoutDayIndex === 'number' ? stop.checkoutDayIndex + 1 : null;

  return (
    <View className="flex-row mb-3">
      <View className="items-center mr-3" style={{ width: 14 }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#2B8EF0',
            backgroundColor: '#FFFFFF',
          }}
        />
        <View
          style={{
            width: 2,
            flex: 1,
            minHeight: showConnector ? 24 : 84,
            marginTop: 4,
            backgroundColor: '#BFDBFE',
          }}
        />
      </View>

      <Button
        activeOpacity={0.9}
        onPress={onPress}
        onLongPress={onEditTime}
        className="flex-1 rounded-2xl p-3"
        style={{
          backgroundColor: '#F8FAFC',
          shadowColor: '#0F172A',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 5 },
          elevation: 3,
        }}
      >
        <View className="flex-row">
          <View style={{ width: 136, marginRight: 12, position: 'relative' }}>
            <Image
              source={{ uri: stop.image || 'https://via.placeholder.com/140x100?text=Place' }}
              style={{ width: 136, height: 92, borderRadius: 16, backgroundColor: '#E5E7EB' }}
            />

            <View
              className="flex-row items-center"
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.95)',
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                <Path
                  d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  stroke="#111827"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text className="text-[10px] text-gray-800 ml-1" style={{ fontWeight: '400' }}>
                {typeof stop.rating === 'number' ? stop.rating.toFixed(1) : '4.8'}
              </Text>
            </View>
          </View>

          <View className="flex-1">
            <View className="flex-row items-start justify-between">
              <Text className="flex-1 text-[15px] leading-5 text-gray-900 mr-2" style={{ fontWeight: '400' }} numberOfLines={2}>
                {stop.title}
              </Text>
              <View className="flex-row items-center">
                <Button onPress={onDelete} disabled={deleting} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                  {deleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M18 6 6 18M6 6l12 12" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
                    </Svg>
                  )}
                </Button>
              </View>
            </View>

            <View className="flex-row items-center mt-1.5">
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 6v6l4 2M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text className="text-[11px] text-gray-600 ml-1" style={{ fontWeight: '400' }}>
                {stop.durationLabel}
              </Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <Path
                  d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  stroke="#6B7280"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text className="text-[11px] text-gray-600 ml-1" style={{ fontWeight: '400' }}>
                {formatCostLabel(displayedCost, hasActualCost)}
              </Text>
            </View>

            <View className="flex-row items-center mt-1.5">
              <View className="rounded-full px-3 py-1" style={{ backgroundColor: '#DBEAFE' }}>
                <Text className="text-[10px]" style={{ color: '#3B82F6', fontWeight: '400' }}>
                  {stop.startTimeLabel} - {stop.endTimeLabel || '--:--'}
                </Text>
              </View>
              <View className="rounded-full px-3 py-1 ml-2" style={{ backgroundColor: '#DCFCE7' }}>
                <Text className="text-[10px]" style={{ color: '#16A34A', fontWeight: '400' }}>
                  {moodLabel}
                </Text>
              </View>
            </View>

            {hasHotelStayInfo ? (
              <View className="mt-2 rounded-xl px-3 py-2" style={{ backgroundColor: '#FFF7ED' }}>
                <Text className="text-[10px]" style={{ color: '#9A3412', fontWeight: '600' }}>
                  Khách sạn: Check-in{checkinDayLabel ? ` ngày ${checkinDayLabel}` : ''} {stop.checkinTime || stop.startTimeLabel} • Check-out{checkoutDayLabel ? ` ngày ${checkoutDayLabel}` : ''} {stop.checkoutTime}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Button>
    </View>
  );
};
