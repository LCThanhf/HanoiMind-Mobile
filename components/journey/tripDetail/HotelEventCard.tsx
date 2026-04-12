import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Button } from '../../shared';

interface HotelEventCardProps {
  type: 'checkin' | 'checkout';
  dayLabel: number;
  placeName: string;
  timeLabel?: string;
  onPress: () => void;
}

export const HotelEventCard = ({ type, dayLabel, placeName, timeLabel, onPress }: HotelEventCardProps) => {
  const isCheckin = type === 'checkin';

  return (
    <Button
      activeOpacity={0.88}
      onPress={onPress}
      className="rounded-2xl px-4 py-3 mb-3"
      style={{
        backgroundColor: isCheckin ? '#ECFDF5' : '#FFF7ED',
        borderWidth: 1,
        borderColor: isCheckin ? '#BBF7D0' : '#FED7AA',
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d={isCheckin ? 'M12 3v18M5 10l7-7 7 7' : 'M12 3v18M19 14l-7 7-7-7'}
              stroke={isCheckin ? '#15803D' : '#C2410C'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text className="text-[12px] ml-1.5" style={{ color: isCheckin ? '#166534' : '#9A3412', fontWeight: '700' }}>
            {isCheckin ? `Hotel Check-in (Ngày ${dayLabel})` : `Hotel Check-out (Ngày ${dayLabel})`}
          </Text>
        </View>

        {timeLabel ? (
          <Text className="text-[12px]" style={{ color: isCheckin ? '#166534' : '#9A3412', fontWeight: '700' }}>
            {timeLabel}
          </Text>
        ) : null}
      </View>

      <Text className="text-[12px] mt-1" style={{ color: '#374151', fontWeight: '600' }} numberOfLines={1}>
        {placeName}
      </Text>
    </Button>
  );
};
