import React from 'react';
import { Text, View } from 'react-native';

import { Place } from '../../services/placeService/place.type';

interface StepThreeConfirmProps {
  tripName: string;
  dateRangeSummary: string;
  isSoloMode: boolean;
  selectedMoodTitle?: string;
  budget: string;
  selectedPlaces: Place[];
}

export const StepThreeConfirm = ({
  tripName,
  dateRangeSummary,
  isSoloMode,
  selectedMoodTitle,
  budget,
  selectedPlaces,
}: StepThreeConfirmProps) => (
  <View className="px-5 pb-10">
    <View className="flex-row items-center mb-4">
      <View style={{ width: 4, height: 20, backgroundColor: '#2B8EF0', borderRadius: 2, marginRight: 10 }} />
      <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
        XAC NHAN & CHAY AI
      </Text>
    </View>

    <View style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, marginBottom: 14 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 }}>{tripName || 'Chua dat ten'}</Text>
      <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 2 }}>Ngay di: {dateRangeSummary}</Text>
      <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 2 }}>Mode: {isSoloMode ? 'Solo' : 'Group'}</Text>
      <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 2 }}>Mood: {selectedMoodTitle}</Text>
      <Text style={{ fontSize: 13, color: '#4B5563' }}>Ngan sach: {budget || 'Chua nhap'}</Text>
    </View>

    <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Dia diem da chon ({selectedPlaces.length})</Text>
    {selectedPlaces.map((place) => (
      <View key={place._id} style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, marginBottom: 8 }}>
        <Text style={{ fontSize: 13, color: '#111827', fontWeight: '600' }}>{place.name}</Text>
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>{place.address}</Text>
      </View>
    ))}

    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
      Buoc nay se tao hanh trinh, gan dia diem vao lich trinh ban dau va goi AI toi uu tu dong.
    </Text>
  </View>
);
