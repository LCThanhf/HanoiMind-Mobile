import React from 'react';
import { Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { moodOptions } from './constants';
import { CafeIcon, CalendarIcon, FoodIcon, HealingIcon, MoneyIcon, NatureIcon } from './icons';
import { Button, SectionHeader } from '../shared';
import { MoodId } from './types';

interface StepOneInfoProps {
  tripName: string;
  onChangeTripName: (value: string) => void;
  startDate: string;
  endDate: string;
  onOpenDatePicker: (target: 'start' | 'end') => void;
  budget: string;
  onChangeBudget: (value: string) => void;
  selectedMood: MoodId;
  onSelectMood: (value: MoodId) => void;
  isSoloMode: boolean;
  onToggleMode: () => void;
}

const getMoodIcon = (iconType: string, color: string) => {
  switch (iconType) {
    case 'healing':
      return <HealingIcon color={color} />;
    case 'cafe':
      return <CafeIcon color={color} />;
    case 'nature':
      return <NatureIcon color={color} />;
    case 'food':
      return <FoodIcon color={color} />;
    default:
      return <HealingIcon color={color} />;
  }
};

export const StepOneInfo = ({
  tripName,
  onChangeTripName,
  startDate,
  endDate,
  onOpenDatePicker,
  budget,
  onChangeBudget,
  selectedMood,
  onSelectMood,
  isSoloMode,
  onToggleMode,
}: StepOneInfoProps) => (
  <>
    <View className="px-5">
      <SectionHeader title="Các thông tin cơ bản" paddingHorizontal={0} paddingTop={0} paddingBottom={0} marginBottom={16} />

      <View className="mb-3">
        <Text className="text-[13px] text-gray-600 mb-2" style={{ fontWeight: '500' }}>
          Tên chuyến đi
        </Text>
        <View className="flex-row items-center px-4 rounded-xl" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 52 }}>
          <TextInput
            className="flex-1 text-[15px]"
            style={{ fontWeight: '500', color: '#111827' }}
            placeholder="VD: Đi chill với ny cũ"
            placeholderTextColor="#9CA3AF"
            value={tripName}
            onChangeText={onChangeTripName}
            maxLength={80}
          />
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <CalendarIcon />
          <Text className="text-[13px] text-gray-600 ml-2" style={{ fontWeight: '500' }}>
            Thời gian di chuyển
          </Text>
        </View>

        <View className="flex-row" style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text className="text-[11px] text-gray-500 mb-1" style={{ fontWeight: '500' }}>Từ</Text>
            <Button
              activeOpacity={0.8}
              onPress={() => onOpenDatePicker('start')}
              className="flex-row items-center px-4 rounded-xl"
              style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 52 }}
            >
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#111827' }}>{startDate}</Text>
            </Button>
          </View>

          <View style={{ flex: 1 }}>
            <Text className="text-[11px] text-gray-500 mb-1" style={{ fontWeight: '500' }}>Đến</Text>
            <Button
              activeOpacity={0.8}
              onPress={() => onOpenDatePicker('end')}
              className="flex-row items-center px-4 rounded-xl"
              style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 52 }}
            >
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#111827' }}>{endDate}</Text>
            </Button>
          </View>
        </View>
      </View>

      <View className="mb-1">
        <View className="flex-row items-center mb-2">
          <MoneyIcon />
          <Text className="text-[13px] text-gray-600 ml-2" style={{ fontWeight: '500' }}>
            Tổng ngân sách dự kiến
          </Text>
        </View>
        <View
          className="flex-row items-center px-4 rounded-xl"
          style={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            height: 52,
          }}
        >
          <TextInput
            className="flex-1 text-[15px]"
            style={{ fontWeight: '500', color: '#111827' }}
            placeholder="VD: 2.000.000"
            placeholderTextColor="#9CA3AF"
            value={budget}
            onChangeText={onChangeBudget}
            keyboardType="numeric"
          />
          <Text className="text-[14px] text-gray-500" style={{ fontWeight: '600' }}>
            VND
          </Text>
        </View>
      </View>
      <Text className="text-[11px] text-gray-400 mb-6" style={{ fontWeight: '400' }}>
        Ngân sách tối thiểu từ 500.000 VND
      </Text>
    </View>

    <View className="px-5 mb-6">
      <SectionHeader
        title="Tâm trạng di chuyển"
        actionLabel={isSoloMode ? 'Đổi mode: Solo' : 'Đổi mode: Group'}
        onActionPress={onToggleMode}
        showActionIcon={false}
        paddingHorizontal={0}
        paddingTop={0}
        paddingBottom={0}
        marginBottom={16}
      />

      <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
        {moodOptions.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <Button
              key={mood.id}
              style={{ width: '50%', paddingHorizontal: 6, marginBottom: 12 }}
              onPress={() => onSelectMood(mood.id)}
              activeOpacity={0.7}
            >
              <View className="items-center py-5 rounded-2xl relative" style={{ backgroundColor: mood.bgColor, borderWidth: 2, borderColor: isSelected ? '#2B8EF0' : 'transparent' }}>
                {isSelected && (
                  <View className="absolute items-center justify-center" style={{ top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#2B8EF0' }}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                )}
                <View className="items-center justify-center mb-3" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'white' }}>
                  {getMoodIcon(mood.icon, mood.color)}
                </View>
                <Text className="text-[14px] mb-1" style={{ color: '#111827', fontWeight: '600' }}>
                  {mood.title}
                </Text>
                <Text className="text-[11px]" style={{ color: '#6B7280', fontWeight: '400' }}>
                  {mood.budget}
                </Text>
              </View>
            </Button>
          );
        })}
      </View>
    </View>
  </>
);

