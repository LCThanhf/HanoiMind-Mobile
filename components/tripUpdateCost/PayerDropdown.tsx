import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AvatarCircle } from '../shared';
import { MemberProfile } from '../tripBudget/types';
import { formatCost, roleLabel } from './helpers';

interface PayerDropdownProps {
  actualCost: string;
  setActualCost: (value: string) => void;
  perStopEstimated: number;
  payerUserId: string;
  setPayerUserId: (id: string) => void;
  showPayerDropdown: boolean;
  setShowPayerDropdown: (value: boolean | ((prev: boolean) => boolean)) => void;
  members: MemberProfile[];
  selectedPayer: MemberProfile | undefined;
}

export const PayerDropdown = ({
  actualCost,
  setActualCost,
  perStopEstimated,
  payerUserId,
  setPayerUserId,
  showPayerDropdown,
  setShowPayerDropdown,
  members,
  selectedPayer,
}: PayerDropdownProps) => (
  <>
    {/* Actual cost input */}
    <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 8 }}>
      Số tiền thực tế (VNĐ)
    </Text>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 52,
        backgroundColor: 'white',
        marginBottom: 16,
      }}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
        <Path
          d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <TextInput
        style={{ flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' }}
        placeholder={
          perStopEstimated > 0 ? `Dự kiến: ${formatCost(perStopEstimated)}` : 'Nhập số tiền'
        }
        placeholderTextColor="#9CA3AF"
        value={actualCost}
        onChangeText={setActualCost}
        keyboardType="numeric"
      />
    </View>

    {/* Payer dropdown */}
    <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 8 }}>
      Người chi trả
    </Text>
    <View style={{ marginBottom: 24 }}>
      <TouchableOpacity
        onPress={() => setShowPayerDropdown((prev) => !prev)}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 12,
          paddingHorizontal: 14,
          height: 52,
          backgroundColor: 'white',
        }}
      >
        {selectedPayer ? (
          <>
            <AvatarCircle uri={selectedPayer.avatar} name={selectedPayer.name} size={32} />
            <Text
              style={{ flex: 1, fontSize: 15, color: '#111827', fontWeight: '500', marginLeft: 10 }}
            >
              {selectedPayer.name}
            </Text>
          </>
        ) : (
          <>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" />
              </Svg>
            </View>
            <Text
              style={{ flex: 1, fontSize: 15, color: '#9CA3AF', fontWeight: '400', marginLeft: 10 }}
            >
              Chọn người chi trả
            </Text>
          </>
        )}
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d={showPayerDropdown ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      {showPayerDropdown && (
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#0F172A',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
            marginTop: 4,
          }}
        >
          {/* Clear selection row */}
          <TouchableOpacity
            onPress={() => {
              setPayerUserId('');
              setShowPayerDropdown(false);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '500' }}>Bỏ chọn</Text>
          </TouchableOpacity>

          {members.map((member) => (
            <TouchableOpacity
              key={member.userId}
              onPress={() => {
                setPayerUserId(member.userId);
                setShowPayerDropdown(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 11,
                borderTopWidth: 1,
                borderTopColor: '#F3F4F6',
              }}
            >
              <AvatarCircle uri={member.avatar} name={member.name} size={32} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={{ fontSize: 14, color: '#111827', fontWeight: '600' }}
                  numberOfLines={1}
                >
                  {member.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '400' }}>
                  {roleLabel(member.role)}
                </Text>
              </View>
              {payerUserId === member.userId && (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 6L9 17l-5-5"
                    stroke="#22C55E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  </>
);
