import React from 'react';
import { View, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';

interface PillBadgeProps {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  textSize?: number;
  textWeight?: '400' | '500' | '600' | '700' | '800';
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const PillBadge = ({
  label,
  backgroundColor = '#EBF5FF',
  textColor = '#2B8EF0',
  borderColor,
  textSize = 12,
  textWeight = '600',
  containerStyle,
  textStyle,
}: PillBadgeProps) => {
  return (
    <View
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
        },
        containerStyle,
      ]}
    >
      <Text style={[{ color: textColor, fontSize: textSize, fontWeight: textWeight }, textStyle]}>{label}</Text>
    </View>
  );
};
