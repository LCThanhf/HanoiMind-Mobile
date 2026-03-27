import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

interface CardContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const CardContainer = ({ children, style, className }: CardContainerProps) => {
  return (
    <View className={className} style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
