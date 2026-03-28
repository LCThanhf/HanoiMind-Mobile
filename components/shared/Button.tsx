import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style' | 'children'> {
  label?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  rightSlot?: React.ReactNode;
  showChevron?: boolean;
  chevronColor?: string;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth,
  className,
  children,
  rightSlot,
  showChevron = false,
  chevronColor,
  style,
  textColor,
  textStyle,
  activeOpacity = 0.85,
  ...touchableProps
}: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isLink = variant === 'link';

  const minHeight = size === 'sm' ? 40 : size === 'lg' ? 56 : 50;
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 17 : 16;

  const backgroundColor = isPrimary ? '#2B8EF0' : isSecondary ? 'white' : 'transparent';
  const borderWidth = isSecondary ? 1 : 0;

  const defaultTextColor = isPrimary
    ? '#FFFFFF'
    : isSecondary
      ? '#1F2937'
      : isLink
        ? '#2B8EF0'
        : '#374151';

  const resolvedChevronColor = chevronColor || textColor || defaultTextColor;
  const resolvedFullWidth = fullWidth ?? !isLink;
  const hasLabel = typeof label === 'string' && label.length > 0;
  const shouldUseButtonPreset = hasLabel || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      className={className}
      style={[
        shouldUseButtonPreset
          ? {
            width: resolvedFullWidth ? '100%' : undefined,
            alignSelf: resolvedFullWidth ? 'stretch' : 'flex-start',
            borderRadius: 8,
            minHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
            borderWidth,
            borderColor: '#E5E7EB',
            paddingHorizontal: isLink ? 0 : 14,
            opacity: disabled || loading ? 0.7 : 1,
          }
          : { opacity: disabled ? 0.7 : 1 },
        style,
      ]}
      {...touchableProps}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#374151'} />
      ) : hasLabel ? (
        <>
          <Text
            style={[
              {
                color: textColor || defaultTextColor,
                fontSize,
                fontWeight: isLink ? '500' : '600',
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightSlot ? rightSlot : null}
          {!rightSlot && showChevron ? (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
              <Path d="M9 18l6-6-6-6" stroke={resolvedChevronColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : null}
        </>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
