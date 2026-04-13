import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlacesService } from '../../services/placeService/place.service';
import { Place, PlaceCategory } from '../../services/placeService/place.type';
import { JourneyService } from '../../services/journeyService/journey.service';
import { formatCurrencyVnd, useTripDetailData } from './tripDetail/useTripDetailData';
import { Button, ScreenHeader, SearchInput } from '../shared';

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

const parseTimeToDate = (value: string, fallbackMinutes: number) => {
  const parsedMinutes = parseHHmmToMinutes(value);
  const date = new Date();
  if (parsedMinutes !== null) {
    date.setHours(Math.floor(parsedMinutes / 60), parsedMinutes % 60, 0, 0);
    return date;
  }

  date.setHours(Math.floor(fallbackMinutes / 60), fallbackMinutes % 60, 0, 0);
  return date;
};

const formatDateToHHmm = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const HOTEL_LIKE_CATEGORIES = new Set<string>([
  PlaceCategory.ACCOMMODATION,
  PlaceCategory.HOTEL,
  PlaceCategory.HOSTEL,
  PlaceCategory.HOMESTAY,
  PlaceCategory.RESORT,
  PlaceCategory.GUEST_HOUSE,
]);

const isHotelLikeCategory = (category?: string) => {
  if (!category) return false;
  return HOTEL_LIKE_CATEGORIES.has(category);
};

const categoryLabel: Record<string, string> = {
  [PlaceCategory.ACCOMMODATION]: 'Lưu trú',
  [PlaceCategory.HOTEL]: 'Khách sạn',
  [PlaceCategory.HOSTEL]: 'Hostel',
  [PlaceCategory.HOMESTAY]: 'Homestay',
  [PlaceCategory.RESORT]: 'Resort',
  [PlaceCategory.GUEST_HOUSE]: 'Nhà khách',
  [PlaceCategory.RESTAURANT]: 'Nhà hàng',
  [PlaceCategory.CAFE]: 'Cà phê',
  [PlaceCategory.SIGHTSEEING]: 'Tham quan',
  [PlaceCategory.CULTURE]: 'Văn hóa',
  [PlaceCategory.EXPERIENCE]: 'Trải nghiệm',
};

interface HotelStopDraft {
  place: Place;
  checkinMinutes: number;
  checkinDayNumber: number;
  checkoutDayNumber: number;
  checkoutTime: Date;
}

export const TripAddPlaceScreen = ({ tripId, dayNumber, onBack, onPlaceAdded }: TripAddPlaceScreenProps) => {
  const { tripData, budgetSummary, dayPlans } = useTripDetailData(tripId);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [addingPlaceId, setAddingPlaceId] = useState<string>('');
  const [hotelDraft, setHotelDraft] = useState<HotelStopDraft | null>(null);
  const [showCheckoutTimePicker, setShowCheckoutTimePicker] = useState(false);

  const totalJourneyDays = useMemo(() => {
    if (dayPlans.length) return dayPlans.length;
    return Math.max(dayNumber, 1);
  }, [dayPlans.length, dayNumber]);

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
      const selectedDay = dayPlans.find((day) => day.dayNumber === dayNumber);
      const lastStop = selectedDay?.stops?.[selectedDay.stops.length - 1];
      const baseStartMinutes = parseHHmmToMinutes(lastStop?.endTimeRaw || lastStop?.endTimeLabel) ?? 8 * 60;
      const defaultEndMinutes = baseStartMinutes + 120;

      if (isHotelLikeCategory(place.category)) {
        const defaultCheckoutDay = Math.min(dayNumber + 1, totalJourneyDays);
        setHotelDraft({
          place,
          checkinMinutes: baseStartMinutes,
          checkinDayNumber: dayNumber,
          checkoutDayNumber: Math.max(dayNumber, defaultCheckoutDay),
          checkoutTime: parseTimeToDate('12:00', 12 * 60),
        });
        return;
      }

      setAddingPlaceId(place._id);

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

  const closeHotelModal = () => {
    setShowCheckoutTimePicker(false);
    setHotelDraft(null);
  };

  const handleConfirmHotelStop = async () => {
    if (!hotelDraft) return;

    const checkoutTimeText = formatDateToHHmm(hotelDraft.checkoutTime);
    const checkoutMinutes = parseHHmmToMinutes(checkoutTimeText);
    if (checkoutMinutes === null) {
      Alert.alert('Giờ checkout chưa hợp lệ', 'Vui lòng chọn lại giờ checkout.');
      return;
    }

    if (hotelDraft.checkoutDayNumber === hotelDraft.checkinDayNumber && checkoutMinutes <= hotelDraft.checkinMinutes) {
      Alert.alert('Checkout chưa hợp lệ', 'Nếu checkout cùng ngày checkin thì giờ checkout phải sau giờ checkin.');
      return;
    }

    try {
      setAddingPlaceId(hotelDraft.place._id);

      await JourneyService.addStop(tripId, {
        day_index: Math.max(hotelDraft.checkinDayNumber - 1, 0),
        place_id: hotelDraft.place._id,
        start_time: formatMinutesAsHHmm(hotelDraft.checkinMinutes),
        end_time: formatMinutesAsHHmm(hotelDraft.checkinMinutes + 30),
        estimated_cost: hotelDraft.place.estimated_cost_vnd || 0,
        checkout_day_index: Math.max(hotelDraft.checkoutDayNumber - 1, 0),
        checkout_time: checkoutTimeText,
      });

      closeHotelModal();
      onPlaceAdded();
    } catch {
      Alert.alert('Không thể thêm khách sạn', 'Vui lòng thử lại sau.');
    } finally {
      setAddingPlaceId('');
    }
  };

  const handleCheckoutTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowCheckoutTimePicker(false);
    }

    if (event.type === 'dismissed' || !selected) return;

    setHotelDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, checkoutTime: selected };
    });
  };

  const isSavingHotel = !!hotelDraft && addingPlaceId === hotelDraft.place._id;

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

      <Modal visible={!!hotelDraft} transparent animationType="fade" onRequestClose={closeHotelModal}>
        <Pressable
          onPress={closeHotelModal}
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 }}
          >
            <Text className="text-[16px] text-gray-900" style={{ fontWeight: '700' }}>
              Thiết lập check-in / check-out
            </Text>
            <Text className="text-[12px] text-gray-500 mt-1" style={{ fontWeight: '500' }}>
              {hotelDraft?.place.name || 'Khách sạn'}
            </Text>

            <View className="mt-4 rounded-xl p-3" style={{ backgroundColor: '#EFF6FF' }}>
              <Text className="text-[12px]" style={{ color: '#1D4ED8', fontWeight: '600' }}>
                Check-in (lúc đến khách sạn): Ngày {hotelDraft?.checkinDayNumber} • {hotelDraft ? formatMinutesAsHHmm(hotelDraft.checkinMinutes) : '--:--'}
              </Text>
            </View>

            <View className="mt-4">
              <Text className="text-[13px] text-gray-700 mb-2" style={{ fontWeight: '600' }}>
                Ngày checkout
              </Text>
              <View className="flex-row items-center justify-between rounded-xl px-3 py-2" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Button
                  onPress={() =>
                    setHotelDraft((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        checkoutDayNumber: Math.max(prev.checkinDayNumber, prev.checkoutDayNumber - 1),
                      };
                    })
                  }
                  disabled={!hotelDraft || hotelDraft.checkoutDayNumber <= hotelDraft.checkinDayNumber}
                  className="rounded-lg"
                  style={{ width: 34, height: 34, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 18 }}>-</Text>
                </Button>

                <Text className="text-[14px] text-gray-900" style={{ fontWeight: '700' }}>
                  Ngày {hotelDraft?.checkoutDayNumber}
                </Text>

                <Button
                  onPress={() =>
                    setHotelDraft((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        checkoutDayNumber: Math.min(totalJourneyDays, prev.checkoutDayNumber + 1),
                      };
                    })
                  }
                  disabled={!hotelDraft || hotelDraft.checkoutDayNumber >= totalJourneyDays}
                  className="rounded-lg"
                  style={{ width: 34, height: 34, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 18 }}>+</Text>
                </Button>
              </View>
              <Text className="text-[11px] text-gray-500 mt-1" style={{ fontWeight: '500' }}>
                Chuyến đi hiện có {totalJourneyDays} ngày.
              </Text>
            </View>

            <View className="mt-4">
              <Text className="text-[13px] text-gray-700 mb-2" style={{ fontWeight: '600' }}>
                Giờ checkout
              </Text>
              <View className="flex-row items-center justify-between rounded-xl px-3 py-2" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Text className="text-[14px] text-gray-900" style={{ fontWeight: '700' }}>
                  {hotelDraft ? formatDateToHHmm(hotelDraft.checkoutTime) : '--:--'}
                </Text>
                <Button onPress={() => setShowCheckoutTimePicker(true)}>
                  <Text className="text-[14px]" style={{ color: '#2563EB', fontWeight: '700' }}>
                    Đổi giờ
                  </Text>
                </Button>
              </View>
            </View>

            <View className="flex-row items-center justify-end mt-5">
              <Button onPress={closeHotelModal} className="mr-4" disabled={isSavingHotel}>
                <Text className="text-[14px] text-gray-500" style={{ fontWeight: '600' }}>
                  Hủy
                </Text>
              </Button>
              <Button
                onPress={handleConfirmHotelStop}
                disabled={isSavingHotel}
                className="rounded-lg px-4"
                style={{ height: 38, backgroundColor: '#2B8EF0', justifyContent: 'center' }}
              >
                {isSavingHotel ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-[14px] text-white" style={{ fontWeight: '700' }}>
                    Lưu khách sạn
                  </Text>
                )}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {showCheckoutTimePicker && hotelDraft ? (
        <DateTimePicker
          value={hotelDraft.checkoutTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleCheckoutTimeChange}
        />
      ) : null}
    </SafeAreaView>
  );
};
