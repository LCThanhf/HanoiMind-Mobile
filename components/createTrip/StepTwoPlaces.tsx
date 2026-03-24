import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Place } from '../../services/placeService/place.type';
import { SparkleIcon } from './icons';
import { SelectedPlaceSummary } from './types';

interface StepTwoPlacesProps {
  selectedPlaceIds: string[];
  selectedPlaceSummaries: SelectedPlaceSummary[];
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
}: StepTwoPlacesProps) => (
  <View className="px-5 pb-6">
    <View className="flex-row items-center mb-4">
      <View style={{ width: 4, height: 20, backgroundColor: '#2B8EF0', borderRadius: 2, marginRight: 10 }} />
      <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
        CHON DIA DIEM YEU THICH
      </Text>
    </View>

    <View style={{ backgroundColor: '#EBF5FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
      <Text style={{ color: '#1E3A8A', fontSize: 13, fontWeight: '600' }}>
        Da chon {selectedPlaceIds.length} dia diem
      </Text>
      {selectedPlaceSummaries.length > 0 ? (
        <View style={{ marginTop: 8 }}>
          {selectedPlaceSummaries.map((place, index) => (
            <Text
              key={place.id}
              style={{ color: '#1E3A8A', fontSize: 12, fontWeight: '500', marginTop: index === 0 ? 0 : 4 }}
              numberOfLines={1}
            >
              {index + 1}. {place.name}
            </Text>
          ))}
        </View>
      ) : null}
    </View>

    <TouchableOpacity
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
            De AI goi y diem tiep theo
          </Text>
        </>
      )}
    </TouchableOpacity>

    <View className="flex-row items-center px-4 rounded-xl mb-3" style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 48 }}>
      <TextInput
        className="flex-1 text-[14px]"
        placeholder="Tim dia diem..."
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
        return (
          <TouchableOpacity
            key={place._id}
            activeOpacity={0.8}
            onPress={() => onTogglePlace(place._id)}
            style={{
              backgroundColor: selected ? '#EBF5FF' : 'white',
              borderColor: selected ? '#2B8EF0' : '#E5E7EB',
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: selected ? '#2B8EF0' : '#D1D5DB',
                backgroundColor: selected ? '#2B8EF0' : 'white',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selected ? (
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
                {place.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>
                {place.address}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{Math.round(place.rating || 0)}★</Text>
          </TouchableOpacity>
        );
      })
    )}

    {!placesLoading && !filteredPlaces.length ? (
      <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
        Khong tim thay dia diem phu hop.
      </Text>
    ) : null}

    {!placesLoading && filteredPlaces.length > 0 && hasMorePlaces ? (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onLoadMorePlaces}
        disabled={loadingMorePlaces}
        style={{
          height: 44,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#D1E6FF',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FBFF',
          marginTop: 6,
        }}
      >
        {loadingMorePlaces ? (
          <ActivityIndicator color="#2B8EF0" size="small" />
        ) : (
          <Text style={{ color: '#2B8EF0', fontSize: 13, fontWeight: '700' }}>Xem them dia diem</Text>
        )}
      </TouchableOpacity>
    ) : null}
  </View>
);
