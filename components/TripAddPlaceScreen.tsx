import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { PlacesService } from '../services/placeService/place.service';
import { Place, PlaceCategory } from '../services/placeService/place.type';
import { JourneyService } from '../services/journeyService/journey.service';
import { formatCurrencyVnd, useTripDetailData } from './tripDetail/useTripDetailData';

interface TripAddPlaceScreenProps {
  tripId: string;
  dayNumber: number;
  onBack: () => void;
  onPlaceAdded: () => void;
}

const categoryLabel: Record<string, string> = {
  [PlaceCategory.RESTAURANT]: 'Nhà hàng',
  [PlaceCategory.CAFE]: 'Cà phê',
  [PlaceCategory.SIGHTSEEING]: 'Tham quan',
  [PlaceCategory.CULTURE]: 'Văn hóa',
  [PlaceCategory.EXPERIENCE]: 'Trải nghiệm',
};

export const TripAddPlaceScreen = ({ tripId, dayNumber, onBack, onPlaceAdded }: TripAddPlaceScreenProps) => {
  const { tripData, budgetSummary } = useTripDetailData(tripId);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [addingPlaceId, setAddingPlaceId] = useState<string>('');

  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      const response = await PlacesService.findAll({
        page: 1,
        limit: 20,
        sortBy: 'rating',
        sortOrder: 'DESC',
        name: searchText || undefined,
      });
      setPlaces(response.data || []);
    } catch {
      Alert.alert('Không thể tải danh sách địa điểm', 'Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const tripStatText = useMemo(() => {
    const budget = formatCurrencyVnd(budgetSummary.limit || budgetSummary.planned);
    return `${tripData?.days || '--'} • ${budget}`;
  }, [tripData?.days, budgetSummary.limit, budgetSummary.planned]);

  const handleAddPlace = async (place: Place) => {
    try {
      setAddingPlaceId(place._id);
      await JourneyService.addStop(tripId, {
        day_index: Math.max(dayNumber - 1, 0),
        place_id: place._id,
        end_time: '18:00',
        estimated_cost: place.estimated_cost_vnd || 0,
      });
      onPlaceAdded();
    } catch {
      Alert.alert('Không thể thêm địa điểm', 'Vui lòng thử lại sau.');
    } finally {
      setAddingPlaceId('');
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-5 pt-3 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text className="text-[18px] text-gray-900" style={{ fontWeight: '700' }}>
            Thêm địa điểm
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pt-4">
          <View
            className="rounded-2xl p-4 mb-3"
            style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' }}
          >
            <Text className="text-[14px] text-gray-700" style={{ fontWeight: '600' }}>
              {tripData?.title || 'Chuyến đi'}
            </Text>
            <Text className="text-[13px] text-gray-500 mt-1">Ngày {dayNumber}</Text>
            <Text className="text-[12px] text-gray-500 mt-1">{tripStatText}</Text>
          </View>

          <View
            className="rounded-xl px-3"
            style={{ height: 46, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}
          >
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm địa điểm..."
              onSubmitEditing={fetchPlaces}
              style={{ flex: 1, fontSize: 14 }}
            />
          </View>
        </View>

        <View className="px-5 mt-3">
          {loading ? (
            <ActivityIndicator size="large" color="#2B8EF0" style={{ marginTop: 20 }} />
          ) : (
            places.map((place) => (
              <View
                key={place._id}
                className="rounded-2xl p-3 mb-3"
                style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' }}
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: place.images?.[0] || 'https://via.placeholder.com/160x120?text=Place' }}
                    style={{ width: 92, height: 72, borderRadius: 10, marginRight: 12, backgroundColor: '#E5E7EB' }}
                  />

                  <View className="flex-1 justify-between">
                    <View>
                      <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }} numberOfLines={1}>
                        {place.name}
                      </Text>
                      <Text className="text-[12px] text-gray-500 mt-1" numberOfLines={1}>
                        {place.address}
                      </Text>
                      <Text className="text-[12px] text-gray-600 mt-1" style={{ fontWeight: '600' }}>
                        {categoryLabel[place.category] || place.category} • {(place.rating || 0).toFixed(1)}★
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-[12px]" style={{ color: '#16A34A', fontWeight: '600' }}>
                        ~{formatCurrencyVnd(place.estimated_cost_vnd || 0)}
                      </Text>
                      <TouchableOpacity
                        className="rounded-lg px-3"
                        style={{ height: 32, backgroundColor: '#2B8EF0', justifyContent: 'center' }}
                        onPress={() => handleAddPlace(place)}
                        disabled={addingPlaceId === place._id}
                      >
                        {addingPlaceId === place._id ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text className="text-white text-[12px]" style={{ fontWeight: '700' }}>
                            Thêm vào ngày {dayNumber}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
