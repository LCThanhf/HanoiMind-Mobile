import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface PaymentTypeSelectorProps {
  isPrepaid: boolean;
  onChange: (value: boolean) => void;
}

export const PaymentTypeSelector = ({ isPrepaid, onChange }: PaymentTypeSelectorProps) => (
  <>
    {/* Đã trả trước option */}
    <TouchableOpacity
      onPress={() => onChange(true)}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: isPrepaid ? '#22C55E' : '#E5E7EB',
        backgroundColor: isPrepaid ? '#DCFCE7' : 'white',
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: isPrepaid ? '#22C55E' : '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={isPrepaid ? 'white' : '#9CA3AF'} strokeWidth="2" />
          <Path
            d="M9 12l2 2 4-4"
            stroke={isPrepaid ? 'white' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            color: isPrepaid ? '#16A34A' : '#374151',
            fontWeight: '700',
            marginBottom: 2,
          }}
        >
          Đã trả trước
        </Text>
        <Text style={{ fontSize: 12, color: isPrepaid ? '#16A34A' : '#6B7280', fontWeight: '400' }}>
          Chi phí đã được thanh toán trước đó
        </Text>
      </View>
    </TouchableOpacity>

    {/* Thanh toán sau option */}
    <TouchableOpacity
      onPress={() => onChange(false)}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: !isPrepaid ? '#2B8EF0' : '#E5E7EB',
        backgroundColor: !isPrepaid ? '#EBF5FF' : 'white',
        marginBottom: 20,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: !isPrepaid ? '#2B8EF0' : '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={!isPrepaid ? 'white' : '#9CA3AF'} strokeWidth="2" />
          <Path
            d="M12 8v4l3 3"
            stroke={!isPrepaid ? 'white' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            color: !isPrepaid ? '#2B8EF0' : '#374151',
            fontWeight: '700',
            marginBottom: 2,
          }}
        >
          Thanh toán sau
        </Text>
        <Text style={{ fontSize: 12, color: !isPrepaid ? '#2B8EF0' : '#6B7280', fontWeight: '400' }}>
          Chi phí được thanh toán sau khi tới điểm dừng
        </Text>
      </View>
    </TouchableOpacity>
  </>
);
