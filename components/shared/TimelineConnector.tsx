import React from 'react';
import { View } from 'react-native';

interface TimelineConnectorProps {
  isLast?: boolean;
  dotColor?: string;
  lineColor?: string;
  dotSize?: number;
  lineWidth?: number;
  minLineHeight?: number;
}

export const TimelineConnector = ({
  isLast = false,
  dotColor = '#3B82F6',
  lineColor = '#BFDBFE',
  dotSize = 18,
  lineWidth = 2,
  minLineHeight = 18,
}: TimelineConnectorProps) => {
  return (
    <View style={{ marginTop: 2, alignItems: 'center' }}>
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          borderWidth: 2,
          borderColor: dotColor,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}
      >
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />
      </View>

      {!isLast ? (
        <View
          style={{
            width: lineWidth,
            flex: 1,
            minHeight: minLineHeight,
            marginTop: 4,
            backgroundColor: lineColor,
          }}
        />
      ) : null}
    </View>
  );
};
