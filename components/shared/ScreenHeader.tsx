import React from 'react';
import { TouchableOpacity, View, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { BackChevronIcon, BackLineIcon } from './Icons';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showBorder?: boolean;
  backIconType?: 'chevron' | 'line';
  horizontalPadding?: number;
  topPadding?: number;
  bottomPadding?: number;
  titleSize?: number;
  titleWeight?: '400' | '500' | '600' | '700' | '800';
}

export const ScreenHeader = ({
  title,
  onBack,
  rightSlot,
  containerStyle,
  titleStyle,
  showBorder = true,
  backIconType = 'line',
  horizontalPadding = 20,
  topPadding = 12,
  bottomPadding = 14,
  titleSize = 18,
  titleWeight = '600',
}: ScreenHeaderProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: 'white',
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: '#E5E7EB',
          paddingHorizontal: horizontalPadding,
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        },
        containerStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            {backIconType === 'chevron' ? <BackChevronIcon /> : <BackLineIcon />}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <Text style={[{ fontSize: titleSize, color: '#111827', fontWeight: titleWeight }, titleStyle]} numberOfLines={1}>
          {title}
        </Text>

        {rightSlot ? rightSlot : <View style={{ width: 24 }} />}
      </View>
    </View>
  );
};
