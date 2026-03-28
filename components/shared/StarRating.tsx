import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

interface StarRatingProps {
  rating: number;
  total?: number;
  size?: number;
  showValue?: boolean;
  filledColor?: string;
  emptyColor?: string;
}

export const StarRating = ({
  rating,
  total = 5,
  size = 13,
  showValue = true,
  filledColor = '#FBBF24',
  emptyColor = '#E5E7EB',
}: StarRatingProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i < Math.floor(rating);
        const color = active ? filledColor : emptyColor;

        return (
          <Svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ marginRight: 1 }}>
            <Polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={color}
              stroke={color}
              strokeWidth="1"
            />
          </Svg>
        );
      })}

      {showValue ? (
        <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600', marginLeft: 4 }}>{rating}</Text>
      ) : null}
    </View>
  );
};
