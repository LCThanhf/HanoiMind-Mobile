import React from 'react';
import { View, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';

interface StatItemViewProps {
  icon: React.ReactNode;
  value: string | number;
  containerStyle?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

export const StatItemView = ({ icon, value, containerStyle, valueStyle }: StatItemViewProps) => {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }, containerStyle]}>
      {icon}
      <Text style={[{ fontSize: 12, color: '#6B7280', marginLeft: 4, fontWeight: '500' }, valueStyle]}>{value}</Text>
    </View>
  );
};
