import React from 'react';
import { View, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';

interface CharacteristicBadgeProps {
  label: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CharacteristicBadge = ({
  label,
  icon,
  backgroundColor = '#EFF6FF',
  textColor = '#1D4ED8',
  borderColor,
  containerStyle,
  textStyle,
}: CharacteristicBadgeProps) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
        },
        containerStyle,
      ]}
    >
      {icon ? <View style={{ marginRight: 5 }}>{icon}</View> : null}
      <Text style={[{ fontSize: 11, color: textColor, fontWeight: '700' }, textStyle]}>{label}</Text>
    </View>
  );
};
