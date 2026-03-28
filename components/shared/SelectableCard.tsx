import React from 'react';
import { TouchableOpacity, View, Text, type StyleProp, type ViewStyle } from 'react-native';
import { CheckIcon } from './Icons';

interface SelectableCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  backgroundColor?: string;
  selectedBorderColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightSlot?: React.ReactNode;
}

export const SelectableCard = ({
  title,
  subtitle,
  icon,
  selected = false,
  onPress,
  backgroundColor = 'white',
  selectedBorderColor = '#2B8EF0',
  containerStyle,
  rightSlot,
}: SelectableCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: selected ? selectedBorderColor : '#E5E7EB',
          backgroundColor,
          paddingHorizontal: 14,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
        },
        containerStyle,
      ]}
    >
      {icon ? <View style={{ marginRight: 10 }}>{icon}</View> : null}

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>{title}</Text>
        {subtitle ? <Text style={{ marginTop: 3, fontSize: 13, color: '#6B7280' }}>{subtitle}</Text> : null}
      </View>

      {rightSlot ? rightSlot : selected ? (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#2B8EF0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon size={12} color="white" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};
