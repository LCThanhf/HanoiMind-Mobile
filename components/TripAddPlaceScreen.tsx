import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlacesService } from '../services/placeService/place.service';
import { Place, PlaceCategory } from '../services/placeService/place.type';
import { JourneyService } from '../services/journeyService/journey.service';
import { formatCurrencyVnd, useTripDetailData } from './tripDetail/useTripDetailData';
import { Button, ScreenHeader, SearchInput } from './shared';

interface TripAddPlaceScreenProps {
  tripId: string;
  dayNumber: number;
  onBack: () => void;
  onPlaceAdded: () => void;
}

const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const parseHHmmToMinutes = (value?: string | null) => {
  if (!value) return null;
  const match = value.trim().match(HHMM_REGEX);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const formatMinutesAsHHmm = (minutes: number) => {
  const safe = ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const categoryLabel: Record<string, string> = {
  [PlaceCategory.RESTAURANT]: 'Nhà hàng',
  [PlaceCategory.CAFE]: 'Cà phê',
  [PlaceCategory.SIGHTSEEING]: 'Tham quan',
  [PlaceCategory.CULTURE]: 'Văn hóa',
  [PlaceCategory.EXPERIENCE]: 'Trải nghiệm',
};

export const TripAddPlaceScreen = ({ tripId, dayNumber, onBack, onPlaceAdded }: TripAddPlaceScreenProps) => {
  const { tripData, budgetSummary, dayPlans } = useTripDetailData(tripId);
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

      const selectedDay = dayPlans.find((day) => day.dayNumber === dayNumber);
      const lastStop = selectedDay?.stops?.[selectedDay.stops.length - 1];
      const baseStartMinutes = parseHHmmToMinutes(lastStop?.endTimeRaw || lastStop?.endTimeLabel) ?? 8 * 60;
      const defaultEndMinutes = baseStartMinutes + 120;

      await JourneyService.addStop(tripId, {
        day_index: Math.max(dayNumber - 1, 0),
        place_id: place._id,
        start_time: formatMinutesAsHHmm(baseStartMinutes),
        end_time: formatMinutesAsHHmm(defaultEndMinutes),
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
      <ScreenHeader title="Thêm địa điểm" onBack={onBack} titleWeight="700" />

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

          <SearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm địa điểm..."
            onSubmitEditing={fetchPlaces}
          />
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
                      <Button
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
                      </Button>
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
