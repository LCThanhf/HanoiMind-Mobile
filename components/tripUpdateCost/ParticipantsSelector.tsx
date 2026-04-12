import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AvatarCircle, CardContainer } from '../shared';
import { MemberProfile } from '../tripBudget/types';
import { formatCost, roleLabel } from './helpers';

interface ParticipantsSelectorProps {
  members: MemberProfile[];
  selectedParticipantIds: string[];
  onToggle: (userId: string) => void;
  perPersonEstimate: number;
}

export const ParticipantsSelector = ({
  members,
  selectedParticipantIds,
  onToggle,
  perPersonEstimate,
}: ParticipantsSelectorProps) => (
  <>
    {/* Header row */}
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
          <Path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke="#374151"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="9" cy="7" r="4" stroke="#374151" strokeWidth="1.8" />
          <Path
            d="M23 21v-2a4 4 0 0 0-3-3.87"
            stroke="#374151"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            stroke="#374151"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={{ fontSize: 13, color: '#374151', fontWeight: '700' }}>Chia cho ai?</Text>
      </View>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: '#EBF5FF',
        }}
      >
        <Text style={{ fontSize: 12, color: '#2B8EF0', fontWeight: '700' }}>
          {selectedParticipantIds.length}/{members.length}
        </Text>
      </View>
    </View>

    {/* Member list */}
    <CardContainer>
      {members.map((member, idx) => {
        const isSelected = selectedParticipantIds.includes(member.userId);
        return (
          <React.Fragment key={member.userId}>
            {idx > 0 && <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />}
            <TouchableOpacity
              onPress={() => onToggle(member.userId)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <AvatarCircle uri={member.avatar} name={member.name} size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
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
              {/* Checkbox */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isSelected ? '#22C55E' : '#D1D5DB',
                  backgroundColor: isSelected ? '#22C55E' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && (
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </CardContainer>

    {/* Per-person estimate hint */}
    {perPersonEstimate > 0 && (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginTop: 12,
          paddingHorizontal: 4,
        }}
      >
        <Svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginRight: 6, marginTop: 2 }}
        >
          <Circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2" />
          <Path
            d="M12 16v-4M12 8h.01"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
        <Text
          style={{ flex: 1, fontSize: 12, color: '#6B7280', fontWeight: '400', lineHeight: 18 }}
        >
          Số tiền dự kiến cho mỗi người sẽ là{' '}
          <Text style={{ fontWeight: '700', color: '#374151' }}>
            {formatCost(perPersonEstimate)}
          </Text>{' '}
          dựa trên lựa chọn hiện tại.
        </Text>
      </View>
    )}
  </>
);
