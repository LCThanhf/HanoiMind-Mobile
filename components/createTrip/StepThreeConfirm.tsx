import React from 'react';
import { Image, Text, View } from 'react-native';
import { SectionHeader } from '../shared';

interface SelectedPlaceDetail {
  id: string;
  name: string;
  address?: string;
  category?: string;
  rating?: number;
  estimatedCostVnd?: number;
  thumbnail?: string;
}

interface StepThreeConfirmProps {
  tripName: string;
  dateRangeSummary: string;
  isSoloMode: boolean;
  selectedMoodTitle?: string;
  budget: string;
  selectedPlaces: SelectedPlaceDetail[];
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
    <SectionHeader title="Xác nhận và chạy AI" paddingHorizontal={0} paddingTop={0} paddingBottom={0} marginBottom={16} />

    <View style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, marginBottom: 14 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 }}>{tripName || 'Chua dat ten'}</Text>
      <Text style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>Ngày đi: {dateRangeSummary}</Text>
      <Text style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>Mode: {isSoloMode ? 'Solo' : 'Group'}</Text>
      <Text style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>Mood: {selectedMoodTitle}</Text>
      <Text style={{ fontSize: 13, color: '#374151' }}>Ngân sách: {budget || 'Chua nhap'}</Text>
    </View>

    <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
      Địa điểm đã chọn ({selectedPlaces.length})
    </Text>
    {selectedPlaces.map((place, index) => (
      <View
        key={place.id}
        style={{
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 10,
          padding: 10,
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {place.thumbnail ? (
            <Image
              source={{ uri: place.thumbnail }}
              style={{ width: 62, height: 62, borderRadius: 10, marginRight: 10, backgroundColor: '#E5E7EB' }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 62,
                height: 62,
                borderRadius: 10,
                marginRight: 10,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '700' }}>No Img</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: '#111827', fontWeight: '700' }}>
              {index + 1}. {place.name}
            </Text>

            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }} numberOfLines={2}>
              {place.address || 'Chưa có địa chỉ'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <View style={{ backgroundColor: '#F3F4F6', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>
              Loại: {place.category || 'N/A'}
            </Text>
          </View>

          <View style={{ backgroundColor: '#EBF5FF', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, color: '#1D4ED8', fontWeight: '600' }}>
              Rating: {typeof place.rating === 'number' ? `${place.rating.toFixed(1)}★` : 'N/A'}
            </Text>
          </View>

          <View style={{ backgroundColor: '#ECFDF5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, color: '#047857', fontWeight: '600' }}>
              Dự kiến: {typeof place.estimatedCostVnd === 'number' ? `${place.estimatedCostVnd.toLocaleString('vi-VN')} đ` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    ))}
  </View>
);

