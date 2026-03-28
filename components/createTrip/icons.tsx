import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppColors } from '../../utils/theme';

export const HealingIcon = ({ color = AppColors.status.success }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M3 8c3-3 6-3 9 0s6 3 9 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 14c3-3 6-3 9 0s6 3 9 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CafeIcon = ({ color = AppColors.brand.primary }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M17 8h1a4 4 0 0 1 0 8h-1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 1v3M10 1v3M14 1v3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const NatureIcon = ({ color = '#D4A574' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M6.5 21c3-3.5 6-5 9.5-5 0-4-1.5-9-9.5-12 0 6 .5 9 3 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 12c2-1 4-1.5 6-1.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FoodIcon = ({ color = AppColors.status.danger }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 2v20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CalendarIcon = ({ color = AppColors.brand.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const MoneyIcon = ({ color = AppColors.brand.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path
      d="M12 6v12M9 9.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5S14.33 11 13.5 11h-3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const SparkleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="white"
    />
  </Svg>
);
