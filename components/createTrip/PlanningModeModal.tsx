import React from 'react';
import { Modal, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Button } from '../shared';
import { SparkleIcon } from './icons';
import { PlanningMode } from './types';

interface PlanningModeModalProps {
  visible: boolean;
  onClose: () => void;
  planningMode: PlanningMode;
  onSelectMode: (mode: PlanningMode) => void;
}

export const PlanningModeModal = ({
  visible,
  onClose,
  planningMode,
  onSelectMode,
}: PlanningModeModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(17, 24, 39, 0.35)' }}>
        <View
          className="mx-5 rounded-2xl p-5"
          style={{ width: '92%', maxWidth: 420, backgroundColor: 'white' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Chọn cách tạo lịch trình</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#6B7280' }}>
            Bạn muốn dùng AI tối ưu chuyến đi hay tự thêm stop thủ công?
          </Text>

          <View style={{ marginTop: 16, flexDirection: 'row', gap: 10 }}>
            <Button
              onPress={() => onSelectMode('ai')}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: planningMode === 'ai' ? '#2B8EF0' : '#BFDBFE',
                backgroundColor: '#EFF6FF',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#2B8EF0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <SparkleIcon />
              </View>
              <Text style={{ color: '#1D4ED8', fontWeight: '800', fontSize: 14, textAlign: 'center' }}>
                Chuyến đi dùng AI
              </Text>
              <Text style={{ color: '#1D4ED8', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                AI tối ưu tự động
              </Text>
            </Button>

            <Button
              onPress={() => onSelectMode('manual')}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: planningMode === 'manual' ? '#16A34A' : '#BBF7D0',
                backgroundColor: '#F0FDF4',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#22C55E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M4 6.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="white" strokeWidth="1.8" />
                  <Path d="M8 8h8M8 12h8M8 16h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={{ color: '#15803D', fontWeight: '800', fontSize: 14, textAlign: 'center' }}>
                Tự thêm stop
              </Text>
              <Text style={{ color: '#15803D', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                Tùy chỉnh thủ công
              </Text>
            </Button>
          </View>

          <Button
            onPress={onClose}
            className="items-center mt-3 py-2"
          >
            <Text style={{ color: '#6B7280', fontWeight: '600' }}>Để sau</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
};
