import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check, Globe, Users, Lock } from 'lucide-react-native';

export type PrivacyMode = 'public' | 'friends' | 'private';

interface PrivacyOption {
  mode: PrivacyMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface PrivacySelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (mode: PrivacyMode) => void;
  selectedMode: PrivacyMode;
}

const PRIVACY_OPTIONS: PrivacyOption[] = [
  {
    mode: 'public',
    label: 'Công khai',
    description: 'Mọi người có thể xem',
    icon: <Globe size={20} color="#3B82F6" />,
  },
  {
    mode: 'friends',
    label: 'Bạn bè',
    description: 'Chỉ bạn bè có thể xem',
    icon: <Users size={20} color="#3B82F6" />,
  },
  {
    mode: 'private',
    label: 'Riêng tư',
    description: 'Chỉ bạn có thể xem',
    icon: <Lock size={20} color="#3B82F6" />,
  },
];

export const PrivacySelectModal = ({
  visible,
  onClose,
  onSelect,
  selectedMode,
}: PrivacySelectModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 30,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-bold text-gray-900">Quyền riêng tư</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Privacy Options */}
          <View className="gap-3">
            {PRIVACY_OPTIONS.map((option) => {
              const isSelected = selectedMode === option.mode;
              return (
                <TouchableOpacity
                  key={option.mode}
                  onPress={() => {
                    onSelect(option.mode);
                    onClose();
                  }}
                  className={`flex-row items-center p-4 rounded-2xl border ${
                    isSelected ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="mr-3">{option.icon}</View>
                  <View className="flex-1">
                    <Text className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {option.label}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">{option.description}</Text>
                  </View>
                  {isSelected && <Check size={20} color="#2B8EF0" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
