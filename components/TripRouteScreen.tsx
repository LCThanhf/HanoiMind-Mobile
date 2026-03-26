import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Map as MapIcon, Clock, MapPin } from 'lucide-react-native';
import { useTripDetailData } from './tripDetail/useTripDetailData';

interface TripRouteScreenProps {
  tripId: string;
  onBack: () => void;
}

interface RouteStop {
  id: string;
  title: string;
  lat: number;
  lng: number;
  startTimeLabel?: string;
}

interface RouteDay {
  dayNumber: number;
  stops: RouteStop[];
}

const isValidCoordinate = (value?: number | null) => typeof value === 'number' && Number.isFinite(value);

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const toGoogleMapsDirectionUrl = (stops: RouteStop[]) => {
  if (stops.length < 2) return '';

  const origin = `${stops[0].lat},${stops[0].lng}`;
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
  const waypoints = stops.slice(1, -1).map((stop) => `${stop.lat},${stop.lng}`);

  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'driving',
  });

  if (waypoints.length) {
    params.append('waypoints', waypoints.join('|'));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export const TripRouteScreen = ({ tripId, onBack }: TripRouteScreenProps) => {
  const mapRef = useRef<MapView>(null);
  const { isLoading, error, dayPlans, tripData } = useTripDetailData(tripId);

  const routeDays = useMemo<RouteDay[]>(
    () =>
      dayPlans.map((day) => ({
        dayNumber: day.dayNumber,
        stops: day.stops
          .filter((stop) => isValidCoordinate(stop.lat) && isValidCoordinate(stop.lng))
          .map((stop) => ({
            id: stop.id,
            title: stop.title,
            lat: stop.lat as number,
            lng: stop.lng as number,
            startTimeLabel: stop.startTimeLabel,
          })),
      })),
    [dayPlans]
  );

  const defaultDayNumber = useMemo(() => {
    const withRoute = routeDays.find((day) => day.stops.length >= 2);
    if (withRoute) return withRoute.dayNumber;
    return routeDays[0]?.dayNumber;
  }, [routeDays]);

  const [selectedDayNumber, setSelectedDayNumber] = useState<number | undefined>(defaultDayNumber);

  useEffect(() => {
    setSelectedDayNumber((prev) => {
      if (prev && routeDays.some((day) => day.dayNumber === prev)) {
        return prev;
      }
      return defaultDayNumber;
    });
  }, [defaultDayNumber, routeDays]);

  const selectedDay = useMemo(
    () => routeDays.find((day) => day.dayNumber === selectedDayNumber) || routeDays[0],
    [routeDays, selectedDayNumber]
  );

  const coordinates = useMemo(
    () => (selectedDay?.stops || []).map((stop) => ({ latitude: stop.lat, longitude: stop.lng })),
    [selectedDay]
  );

  const straightLineDistanceKm = useMemo(() => {
    if (!selectedDay || selectedDay.stops.length < 2) return 0;

    return selectedDay.stops.slice(1).reduce((total, stop, index) => {
      const prevStop = selectedDay.stops[index];
      return total + getDistanceKm(prevStop.lat, prevStop.lng, stop.lat, stop.lng);
    }, 0);
  }, [selectedDay]);

  const distanceKm = straightLineDistanceKm;

  const estimatedMinutes = useMemo(() => {
    if (distanceKm <= 0) return 0;
    const averageSpeedKmh = 28;
    return Math.round((distanceKm / averageSpeedKmh) * 60);
  }, [distanceKm]);

  useEffect(() => {
    if (!coordinates.length) return;

    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        300
      );
      return;
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 80, right: 50, bottom: 80, left: 50 },
      animated: true,
    });
  }, [coordinates]);

  const handleOpenGoogleMaps = async () => {
    if (!selectedDay || selectedDay.stops.length < 2) return;
    const url = toGoogleMapsDirectionUrl(selectedDay.stops);
    if (!url) return;
    await Linking.openURL(url);
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
          <Text className="text-[18px] text-gray-900" style={{ fontWeight: '600' }}>
            Lộ trình tham quan
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2B8EF0" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
          <View className="px-5 pt-4 pb-2">
            <Text className="text-[20px] text-gray-900" style={{ fontWeight: '700' }}>
              {tripData?.title || 'Hành trình'}
            </Text>
            <Text className="text-[13px] text-gray-500 mt-1" style={{ fontWeight: '500' }}>
              Chọn ngày để xem toàn bộ cung đường di chuyển.
            </Text>
          </View>

          {!!error && (
            <View className="px-5 pb-2">
              <Text className="text-red-500 text-[13px]" style={{ fontWeight: '500' }}>
                {error}
              </Text>
            </View>
          )}

          <View className="px-5 pb-3">
            <View
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                padding: 3,
                flexDirection: 'row',
                width: '100%',
              }}
            >
              {routeDays.map((day) => {
                const selected = day.dayNumber === selectedDay?.dayNumber;
                return (
                  <TouchableOpacity
                    key={day.dayNumber}
                    activeOpacity={0.8}
                    onPress={() => setSelectedDayNumber(day.dayNumber)}
                    style={{
                      flex: 1,
                      backgroundColor: selected ? 'white' : 'transparent',
                      borderRadius: 9,
                      paddingVertical: 8,
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Rect x="3" y="5" width="18" height="16" rx="3" stroke={selected ? '#2B8EF0' : '#6B7280'} strokeWidth="1.8" />
                        <Path d="M8 3v4M16 3v4M3 10h18" stroke={selected ? '#2B8EF0' : '#6B7280'} strokeWidth="1.8" strokeLinecap="round" />
                      </Svg>
                      <Text
                        style={{
                          color: selected ? '#2B8EF0' : '#4B5563',
                          fontWeight: '800',
                          fontSize: 14,
                        }}
                      >
                        Ngày {day.dayNumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            className="mx-5 rounded-2xl overflow-hidden"
            style={{
              height: 280,
              backgroundColor: '#E5E7EB',
              shadowColor: '#0F172A',
              shadowOpacity: 0.12,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: coordinates[0]?.latitude || 21.0278,
                longitude: coordinates[0]?.longitude || 105.8342,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
            >
              {coordinates.length >= 2 && <Polyline coordinates={coordinates} strokeColor="#2563EB" strokeWidth={5} />}

              {(selectedDay?.stops || []).map((stop, index) => (
                <Marker
                  key={stop.id}
                  coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                  title={`${index + 1}. ${stop.title}`}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#2563EB',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{index + 1}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>

          <View className="px-5 pt-4">
            <View
              className="bg-white border border-gray-100 rounded-2xl shadow-sm"
              style={{
                elevation: 4,
                shadowColor: '#1e293b',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <View className="flex-row items-center py-4 px-3">
                <View className="flex-1 items-center space-y-2 border-r border-gray-100">
                  <View className="w-10 h-10 rounded-full bg-blue-50/50 items-center justify-center mb-1">
                    <MapPin size={22} color="#0EA5E9" strokeWidth={2.5} />
                  </View>
                  <Text className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                    SỐ ĐIỂM DỪNG
                  </Text>
                  <Text className="text-[16px] text-slate-800 font-bold">
                    {selectedDay?.stops.length || 0} điểm
                  </Text>
                </View>

                <View className="flex-1 items-center space-y-2 border-r border-gray-100">
                  <View className="w-10 h-10 rounded-full bg-emerald-50/50 items-center justify-center mb-1">
                    <MapIcon size={22} color="#10B981" strokeWidth={2.5} />
                  </View>
                  <Text className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                    QUÃNG ĐƯỜNG
                  </Text>
                  <Text className="text-[16px] text-slate-800 font-bold">
                    {distanceKm ? `${distanceKm.toFixed(1)} km` : '--'}
                  </Text>
                </View>

                <View className="flex-1 items-center space-y-2">
                  <View className="w-10 h-10 rounded-full bg-amber-50/50 items-center justify-center mb-1">
                    <Clock size={22} color="#F59E0B" strokeWidth={2.5} />
                  </View>
                  <Text className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                    THỜI GIAN
                  </Text>
                  <Text className="text-[16px] text-slate-800 font-bold">
                    {estimatedMinutes ? `~${estimatedMinutes}p` : '--'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="px-5 pt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[22px] text-gray-900" style={{ fontWeight: '700' }}>
                Chi tiết các chặng
              </Text>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: '#DBEAFE' }}
              >
                <Text className="text-[11px]" style={{ color: '#3B82F6', fontWeight: '700' }}>
                  Đang tối ưu
                </Text>
              </View>
            </View>

            {selectedDay && selectedDay.stops.length >= 2 ? (
              selectedDay.stops.slice(1).map((stop, index) => {
                const prev = selectedDay.stops[index];
                const legDistance = getDistanceKm(prev.lat, prev.lng, stop.lat, stop.lng);
                return (
                  <View
                    key={`${prev.id}-${stop.id}`}
                    className="rounded-2xl px-4 py-3 mb-2"
                    style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row" style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ marginTop: 2, alignItems: 'center' }}>
                          <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                            <Circle cx="9" cy="9" r="7" stroke="#3B82F6" strokeWidth="2" />
                            <Circle cx="9" cy="9" r="3" fill="#3B82F6" />
                          </Svg>
                          {index !== selectedDay.stops.length - 2 && (
                            <View style={{ width: 2, flex: 1, minHeight: 18, marginTop: 4, backgroundColor: '#BFDBFE' }} />
                          )}
                        </View>

                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text className="text-[18px] text-gray-900" style={{ fontWeight: '700' }} numberOfLines={1}>
                            {stop.title}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Text className="text-[12px] text-gray-500" style={{ fontWeight: '600' }}>
                              Điểm dừng {index + 2}
                            </Text>
                            <Text className="text-[12px] text-gray-400 mx-2">•</Text>
                            <Text className="text-[12px] text-gray-500" style={{ fontWeight: '600' }}>
                              {index === 0 ? 'Bắt đầu' : `${legDistance.toFixed(1)} km từ điểm ${index + 1}`}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                          <Circle cx="12" cy="12" r="8" stroke="#22C55E" strokeWidth="2" />
                          <Path d="M12 8v4l3 2" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text className="text-[13px] ml-1" style={{ color: '#22C55E', fontWeight: '700' }}>
                          {stop.startTimeLabel || '--:--'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="rounded-xl px-4 py-3" style={{ backgroundColor: '#F8FAFC' }}>
                <Text className="text-[13px] text-gray-500" style={{ fontWeight: '500' }}>
                  Cần ít nhất 2 địa điểm có tọa độ để tạo lộ trình.
                </Text>
              </View>
            )}
          </View>

          <View className="px-5 pt-5">
            <TouchableOpacity
              className="items-center justify-center rounded-xl"
              style={{ height: 48, backgroundColor: '#2B8EF0', opacity: selectedDay && selectedDay.stops.length >= 2 ? 1 : 0.5 }}
              disabled={!selectedDay || selectedDay.stops.length < 2}
              onPress={handleOpenGoogleMaps}
            >
              <Text className="text-white text-[15px]" style={{ fontWeight: '700' }}>
                Mở trong Google Maps
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};