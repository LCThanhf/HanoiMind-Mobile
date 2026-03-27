import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  rightSlot,
  style,
  textColor,
}: ButtonProps) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          width: '100%',
          borderRadius: 8,
          minHeight: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary ? '#2B8EF0' : 'white',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: '#E5E7EB',
          opacity: disabled || loading ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#374151'} />
      ) : (
        <>
          <Text
            style={{
              color: textColor || (isPrimary ? '#FFFFFF' : '#1F2937'),
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {label}
          </Text>
          {rightSlot ? rightSlot : null}
        </>
      )}
    </TouchableOpacity>
  );
};
