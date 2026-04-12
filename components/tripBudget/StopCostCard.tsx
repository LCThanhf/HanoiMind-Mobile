import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { CostType } from '../../services/journeyService/journey.type';
import { AvatarCircle, CardContainer } from '../shared';
import { StopCostItem } from './types';

const formatCost = (value: number): string =>
  `${value.toLocaleString('vi-VN')} đ`;

interface StopCostCardProps {
  stop: StopCostItem;
  onUpdatePress: () => void;
}

export const StopCostCard = ({ stop, onUpdatePress }: StopCostCardProps) => {
  const isUnderPaid =
    stop.actualCost !== undefined && stop.actualCost < stop.estimatedCost;

  return (
    <CardContainer style={{ marginBottom: 12 }}>
      {/* Header: place name + status badge */}
      <View style={{ padding: 14, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6, flexShrink: 0 }}>
              <Path
                d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"
                stroke="#22C55E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="12" cy="11" r="2" stroke="#22C55E" strokeWidth="1.8" />
            </Svg>
            <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700', flex: 1 }}>
              {stop.placeName}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
              backgroundColor: stop.isPrepaid ? '#DCFCE7' : '#EBF5FF',
            }}
          >
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
              <Circle cx="12" cy="12" r="10" stroke={stop.isPrepaid ? '#16A34A' : '#2B8EF0'} strokeWidth="2.2" />
              <Path
                d={stop.isPrepaid ? 'M9 12l2 2 4-4' : 'M12 8v4l3 3'}
                stroke={stop.isPrepaid ? '#16A34A' : '#2B8EF0'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={{ fontSize: 10, color: stop.isPrepaid ? '#16A34A' : '#2B8EF0', fontWeight: '600' }}>
              {stop.isPrepaid ? 'Đã trả trước' : 'Thanh toán sau'}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '400', marginBottom: 8, marginLeft: 27 }}>
          Điểm dừng số {stop.stopSequence}
        </Text>

        {stop.costType === CostType.SHARED && (
          <View style={{ marginLeft: 22 }}>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: '#EBF5FF',
              }}
            >
              <Text style={{ fontSize: 11, color: '#2B8EF0', fontWeight: '500' }}>Chia đều nhóm</Text>
            </View>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

      {/* Cost comparison row */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 }}>Dự kiến</Text>
          <Text style={{ fontSize: 15, color: '#374151', fontWeight: '600' }}>
            {formatCost(stop.estimatedCost)}
          </Text>
        </View>

        <View style={{ width: 1, backgroundColor: '#F3F4F6' }} />

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 }}>Thực tế</Text>
          {stop.actualCost !== undefined ? (
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: isUnderPaid ? '#FEE2E2' : '#DCFCE7',
              }}
            >
              <Text style={{ fontSize: 15, color: isUnderPaid ? '#DC2626' : '#16A34A', fontWeight: '700' }}>
                {formatCost(stop.actualCost)}
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '400', fontStyle: 'italic' }}>
              Chưa cập nhật
            </Text>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

      {/* Payer + update action */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
          {stop.payerName ? (
            <>
              <AvatarCircle uri={stop.payerAvatar} name={stop.payerName} size={28} />
              <View style={{ marginLeft: 8 }}>
                <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '400' }}>Người trả</Text>
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }} numberOfLines={1}>
                  {stop.payerName}
                </Text>
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '400', fontStyle: 'italic' }}>
              Chưa có người trả
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onUpdatePress}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 13, color: '#2B8EF0', fontWeight: '600' }}>Cập nhật chi phí</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
            <Path d="M9 18l6-6-6-6" stroke="#2B8EF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>
    </CardContainer>
  );
};
