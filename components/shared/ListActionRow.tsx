import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ListActionRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  titleColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showBorderBottom?: boolean;
  borderBottomColor?: string;
  iconContainerBackgroundColor?: string;
  iconContainerSize?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  showChevron?: boolean;
  chevronColor?: string;
  titleSize?: number;
  subtitleSize?: number;
}

export const ListActionRow = ({
  icon,
  title,
  subtitle,
  titleColor = '#111827',
  rightElement,
  onPress,
  showBorderBottom = true,
  borderBottomColor = '#F3F4F6',
  iconContainerBackgroundColor,
  iconContainerSize = 44,
  horizontalPadding = 16,
  verticalPadding = 14,
  showChevron = false,
  chevronColor = '#111827',
  titleSize = 16,
  subtitleSize = 13,
}: ListActionRowProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
          borderBottomWidth: showBorderBottom ? 1 : 0,
          borderBottomColor,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            width: iconContainerSize,
            height: iconContainerSize,
            borderRadius: iconContainerSize * 0.28,
            backgroundColor: iconContainerBackgroundColor || 'transparent',
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.textWrap}>
        <Text style={{ color: titleColor, fontWeight: '500', fontSize: titleSize }}>{title}</Text>
        {subtitle ? <Text style={{ marginTop: 2, color: '#6B7280', fontSize: subtitleSize }}>{subtitle}</Text> : null}
      </View>

      {rightElement ? rightElement : null}

      {!rightElement && showChevron ? (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18l6-6-6-6" stroke={chevronColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
});
