import React from 'react';
import { Text } from 'react-native';

interface SectionLabelProps {
  title: string;
  marginTop?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
}

export const SectionLabel = ({
  title,
  marginTop = 8,
  paddingHorizontal = 20,
  paddingVertical = 12,
}: SectionLabelProps) => {
  return (
    <Text
      style={{
        paddingHorizontal,
        paddingVertical,
        marginTop,
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}
    >
      {title}
    </Text>
  );
};
