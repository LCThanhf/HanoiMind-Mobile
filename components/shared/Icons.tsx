import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const BackChevronIcon = ({ size = 24, color = '#374151', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BackLineIcon = ({ size = 24, color = '#111827', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SearchIcon = ({ size = 18, color = '#9CA3AF', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon = ({ size = 12, color = 'white', strokeWidth = 2.4 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const DotCircleIcon = ({ size = 18, color = '#3B82F6' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Circle cx="9" cy="9" r="7" stroke={color} strokeWidth="2" />
    <Circle cx="9" cy="9" r="3" fill={color} />
  </Svg>
);
