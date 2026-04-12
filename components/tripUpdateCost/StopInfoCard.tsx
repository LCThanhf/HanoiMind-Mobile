import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { CardContainer } from '../shared';
import { StopCostItem } from '../tripBudget/types';
import { costTypeLabel } from './helpers';

interface StopInfoCardProps {
  stop: StopCostItem;
}

export const StopInfoCard = ({ stop }: StopInfoCardProps) => (
  <CardContainer style={{ marginBottom: 20 }}>
    {/* Place name row */}
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        paddingBottom: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#DCFCE7',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"
            stroke="#16A34A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="11" r="2" stroke="#16A34A" strokeWidth="1.8" />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 10,
            color: '#9CA3AF',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 3,
          }}
        >
          Tên địa điểm
        </Text>
        <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>
          {stop.placeName}
        </Text>
      </View>
    </View>

    <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

    {/* Cost type row */}
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        paddingTop: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#EBF5FF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke="#2B8EF0"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="9" cy="7" r="4" stroke="#2B8EF0" strokeWidth="1.8" />
          <Path
            d="M23 21v-2a4 4 0 0 0-3-3.87"
            stroke="#2B8EF0"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            stroke="#2B8EF0"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 10,
            color: '#9CA3AF',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 3,
          }}
        >
          Loại chi phí
        </Text>
        <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>
          {costTypeLabel(stop.costType)}
        </Text>
      </View>
    </View>
  </CardContainer>
);
