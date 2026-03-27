import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface ActionCardProps {
  title: string;
  subtitle?: string;
  leftIcon: React.ReactNode;
  onPress?: () => void;
  containerBackgroundColor?: string;
  borderColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  rightText?: string;
  rightTextColor?: string;
  marginTop?: number;
  activeOpacity?: number;
}

export const ActionCard = ({
  title,
  subtitle,
  leftIcon,
  onPress,
  containerBackgroundColor = '#EBF5FF',
  borderColor = '#BFDBFE',
  titleColor = '#1D4ED8',
  subtitleColor = '#3B82F6',
  rightText = '›',
  rightTextColor = '#3B82F6',
  marginTop = 0,
  activeOpacity = 0.88,
}: ActionCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: containerBackgroundColor,
          borderColor,
          marginTop,
        },
      ]}
    >
      <View style={styles.leftIconWrap}>{leftIcon}</View>

      <View style={styles.contentWrap}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text> : null}
      </View>

      <Text style={[styles.rightText, { color: rightTextColor }]}>{rightText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIconWrap: {
    marginRight: 10,
  },
  contentWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  rightText: {
    fontSize: 20,
    lineHeight: 20,
  },
});
