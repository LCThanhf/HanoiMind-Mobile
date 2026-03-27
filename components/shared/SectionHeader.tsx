import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  showAccent?: boolean;
  marginBottom?: number;
  showActionIcon?: boolean;
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingBottom?: number;
  titleSize?: number;
  titleWeight?: '400' | '500' | '600' | '700' | '800';
  titleColor?: string;
  actionColor?: string;
}

export const SectionHeader = ({
  title,
  actionLabel,
  onActionPress,
  showAccent = true,
  marginBottom = 16,
  showActionIcon = true,
  paddingHorizontal = 16,
  paddingTop = 16,
  paddingBottom = 12,
  titleSize = 15,
  titleWeight = '700',
  titleColor = '#111827',
  actionColor = '#2B8EF0',
}: SectionHeaderProps) => {
  return (
    <View style={[styles.container, { marginBottom, paddingHorizontal, paddingTop, paddingBottom }]}>
      <View style={styles.leftWrap}>
        {showAccent ? <View style={styles.accent} /> : null}
        <Text style={[styles.title, { fontSize: titleSize, fontWeight: titleWeight, color: titleColor }]}>{title}</Text>
      </View>

      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7} style={styles.actionWrap}>
          <Text style={[styles.actionText, { color: actionColor }]}>{actionLabel}</Text>
          {showActionIcon ? (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.actionIcon}>
              <Path d="M9 18l6-6-6-6" stroke={actionColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accent: {
    width: 4,
    height: 20,
    backgroundColor: '#2B8EF0',
    borderRadius: 2,
    marginRight: 10,
  },
  title: {
    color: '#111827',
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#2B8EF0',
    fontSize: 13,
    fontWeight: '500',
  },
  actionIcon: {
    marginLeft: 2,
  },
});
