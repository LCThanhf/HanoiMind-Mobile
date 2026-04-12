import React from 'react';
import { ActivityIndicator, Image, Text, TextInput, View } from 'react-native';

import { Place } from '../../services/placeService/place.type';
import { SparkleIcon } from './icons';
import { Button, CardContainer, SectionHeader } from '../shared';
import { SelectedPlaceSummary } from './types';

interface StepTwoPlacesProps {
  selectedPlaceIds: string[];
  selectedPlaceSummaries: SelectedPlaceSummary[];
  onRemoveSelectedPlace: (placeId: string) => void;
  isAiSelectingPlaces: boolean;
  isProcessing: boolean;
  placesLoading: boolean;
  onAiSelectPlaces: () => void;
  placesSearch: string;
  onChangePlacesSearch: (value: string) => void;
  filteredPlaces: Place[];
  onTogglePlace: (placeId: string) => void;
  hasMorePlaces: boolean;
  loadingMorePlaces: boolean;
  onLoadMorePlaces: () => void;
}

export const StepTwoPlaces = ({
  selectedPlaceIds,
  selectedPlaceSummaries,
  onRemoveSelectedPlace,
  isAiSelectingPlaces,
  isProcessing,
  placesLoading,
  onAiSelectPlaces,
  placesSearch,
  onChangePlacesSearch,
  filteredPlaces,
  onTogglePlace,
  hasMorePlaces,
  loadingMorePlaces,
  onLoadMorePlaces,
}: StepTwoPlacesProps) => {
  const formatCurrencyVnd = (value?: number) => {
    if (!value || value <= 0) return 'Chưa rõ chi phí';
    return `${value.toLocaleString('vi-VN')} đ`;
  };

  return (
    <View className="px-5 pb-6">
      <SectionHeader title="Chọn địa điểm mong muốn" paddingHorizontal={0} paddingTop={0} paddingBottom={0} marginBottom={16} />

      <View style={{ backgroundColor: '#EBF5FF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
        <Text style={{ color: '#1E3A8A', fontSize: 13, fontWeight: '600' }}>
          Đã chọn {selectedPlaceIds.length} địa điểm
        </Text>
        {selectedPlaceSummaries.length > 0 ? (
          <View style={{ marginTop: 10, gap: 8 }}>
            {selectedPlaceSummaries.map((place, index) => (
              <CardContainer
                key={place.id}
                style={{
                  backgroundColor: '#F8FBFF',
                  borderColor: '#DBEAFE',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <Text
                  style={{ color: '#1E3A8A', fontSize: 12, fontWeight: '600', flex: 1 }}
                  numberOfLines={1}
                >
                  {index + 1}. {place.name}
                </Text>
                <Button
                  onPress={() => onRemoveSelectedPlace(place.id)}
                  activeOpacity={0.7}
                  style={{
                    borderWidth: 1,
                    borderColor: '#FCA5A5',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: '#FEF2F2',
                  }}
                >
                  <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>Xóa</Text>
                </Button>
              </CardContainer>
            ))}
          </View>
        ) : null}
      </View>

      <Button
        activeOpacity={0.85}
        onPress={onAiSelectPlaces}
        disabled={isAiSelectingPlaces || isProcessing || placesLoading}
        style={{
          backgroundColor: '#2B8EF0',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 12,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isAiSelectingPlaces || isProcessing || placesLoading ? 0.75 : 1,
        }}
      >
        {isAiSelectingPlaces ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <SparkleIcon />
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '700', marginLeft: 8 }}>
              Để AI gợi ý địa điểm tiếp theo
            </Text>
          </>
        )}
      </Button>

      <View className="flex-row items-center px-4 rounded-xl mb-3" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 48 }}>
        <TextInput
          className="flex-1 text-[14px]"
          placeholder="Tìm địa điểm..."
          placeholderTextColor="#9CA3AF"
          value={placesSearch}
          onChangeText={onChangePlacesSearch}
        />
      </View>

      {placesLoading ? (
        <View className="py-10 items-center">
          <ActivityIndicator size="large" color="#2B8EF0" />
        </View>
      ) : (
        filteredPlaces.map((place) => {
          const selected = selectedPlaceIds.includes(place._id);
          const thumbnail = place.images?.[0] || 'https://via.placeholder.com/220x160/E5E7EB/9CA3AF?text=Place';
          return (
            <Button
              key={place._id}
              activeOpacity={0.8}
              onPress={() => onTogglePlace(place._id)}
              style={{
                backgroundColor: selected ? '#F0F7FF' : 'white',
                borderColor: selected ? '#2B8EF0' : '#E5E7EB',
                borderWidth: 1.2,
                borderRadius: 16,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'stretch',
                overflow: 'hidden',
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Image
                source={{ uri: thumbnail }}
                style={{ width: 88, height: 88, backgroundColor: '#E5E7EB' }}
                resizeMode="cover"
              />
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: '#111827', fontWeight: '700', flex: 1 }} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      borderWidth: 1.5,
                      borderColor: selected ? '#2B8EF0' : '#D1D5DB',
                      backgroundColor: selected ? '#2B8EF0' : 'white',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 8,
                    }}
                  >
                    {selected ? (
                      <Text style={{ color: 'white', fontWeight: '900', fontSize: 12 }}>✓</Text>
                    ) : null}
                  </View>
                </View>

                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }} numberOfLines={1}>
                  {place.address || 'Chưa có địa chỉ'}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                  <View style={{ backgroundColor: '#F3F4F6', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, color: '#374151', fontWeight: '700' }}>
                      {Math.round(place.rating || 0)}★
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#ECFDF5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, color: '#166534', fontWeight: '700' }} numberOfLines={1}>
                      {formatCurrencyVnd(place.estimated_cost_vnd)}
                    </Text>
                  </View>
                </View>
              </View>
            </Button>
          );
        })
      )}

      {!placesLoading && !filteredPlaces.length ? (
        <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
          Khong tim thay dia diem phu hop.
        </Text>
      ) : null}

      {!placesLoading && filteredPlaces.length > 0 && hasMorePlaces ? (
        <Button
          activeOpacity={0.8}
          onPress={onLoadMorePlaces}
          disabled={loadingMorePlaces}
          style={{
            height: 44,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#EBF5FF',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8FBFF',
            marginTop: 6,
          }}
        >
          {loadingMorePlaces ? (
            <ActivityIndicator color="#2B8EF0" size="small" />
          ) : (
            <Text style={{ color: '#2B8EF0', fontSize: 13, fontWeight: '700' }}>Xem thêm địa điểm</Text>
          )}
        </Button>
      ) : null}
    </View>
  );
};

