import React from 'react';
import { View, Text } from 'react-native';

interface TripStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBgColor: string;
}

export const TripStatCard = ({ icon, label, value, iconBgColor }: TripStatCardProps) => {
  return (
    <View
      className="flex-1 p-4 rounded-2xl"
      style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F3F4F6' }}
    >
      <View
        className="items-center justify-center mb-2"
        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: iconBgColor }}
      >
        {icon}
      </View>
      <Text className="text-[12px] text-gray-600 mb-1" style={{ fontWeight: '500' }}>
        {label}
      </Text>
      <Text className="text-[16px] text-gray-900" style={{ fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
};
