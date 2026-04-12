/**
 * Journey Tracking Screen
 * Displays real-time route tracking with Google Maps + ORS integration
 * Supports flexible check-in: Host (camera/photo) and Members (QR scan)
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Camera, QrCode, MapPin, Clock, Navigation, X, MoreVertical, CheckCircle, Users } from 'lucide-react-native';
import { Button, ScreenHeader } from '../../shared';
import { QRCheckInModal } from './trackingModals/QRCheckInModal';
import { fetchCompleteRoute, RouteCoordinate } from '../../../utils/routeUtils';
import { JourneyService } from '../../../services/journeyService/journey.service';
import { MemberScannerModal } from './trackingModals/MemberScanningModal';
import { Journey, JourneyDay, JourneyStop, JourneyStatus, StopStatus } from '../../../services/journeyService/journey.type';
import { UsersService } from '../../../services/userService/user.service';
import { PlacesService } from '../../../services/placeService/place.service';
import { Place } from '../../../services/placeService/place.type';
import { CheckInProgressModal } from './trackingModals';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snap points for bottom sheet (50%, 75%, 90% of screen height)
const SNAP_POINTS = [
  SCREEN_HEIGHT * 0.50,
  SCREEN_HEIGHT * 0.75,
  SCREEN_HEIGHT * 0.90,
];

const TRANSLATE_Y_SNAPS = [
  0,
  -(SNAP_POINTS[1] - SNAP_POINTS[0]),
  -(SNAP_POINTS[2] - SNAP_POINTS[0]),
];

interface StopWithPlace extends JourneyStop {
  place?: Place;
}

interface JourneyTrackingScreenProps {
  journeyId: string;
  userId: string;
  onBack: () => void;
}

export const JourneyTrackingScreen: React.FC<JourneyTrackingScreenProps> = ({
  journeyId,
  userId,
  onBack,
}) => {
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // State management
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [checkInData, setCheckInData] = useState<any>(null);
  const [isFetchingProgress, setIsFetchingProgress] = useState(false);
  const [stopsWithPlaces, setStopsWithPlaces] = useState<StopWithPlace[]>([]);
  const [travelMode, setTravelMode] = useState<'driving-car' | 'foot-walking' | 'cycling-regular'>(
    'driving-car'
  );
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  // Multi-snap animation
  const pan = useRef(new Animated.Value(0)).current;
  const currentPanValue = useRef(0);

  useEffect(() => {
    const listener = pan.addListener((val) => {
      currentPanValue.current = val.value;
    });
    return () => pan.removeListener(listener);
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderGrant: () => {
        pan.setOffset(currentPanValue.current);
        pan.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: pan }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        const projectedY = currentPanValue.current + gestureState.vy * 100;
        const nearestSnap = TRANSLATE_Y_SNAPS.reduce((prev, curr) => {
          return Math.abs(curr - projectedY) < Math.abs(prev - projectedY) ? curr : prev;
        });

        Animated.spring(pan, {
          toValue: nearestSnap,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();
      },
    })
  ).current;

  // Get current day
  const currentDay = useMemo(() => {
    if (!journey?.days || journey.days.length === 0) return null;
    // Use currentDayIndex, ensuring it's within bounds
    const dayIndex = Math.min(currentDayIndex, journey.days.length - 1);
    return journey.days[dayIndex];
  }, [journey, currentDayIndex]);

  // Load journey data
  const loadJourney = async () => {
    try {
      if (!journey) setIsLoading(true);
      const data = await JourneyService.findOne(journeyId) as Journey;
      setJourney(data);

      // Fetch current user ID if not provided
      let currentUserId = userId;
      if (!currentUserId) {
        try {
          const currentUser = await UsersService.getMe();
          currentUserId = currentUser._id;
        } catch (error) {
          console.error('[JourneyTrackingScreen] Error fetching current user:', error);
        }
      }

      // Check if current user is host
      setIsHost(data.owner_id === currentUserId);
    } catch (error) {
      console.error('[JourneyTrackingScreen] Error loading journey:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu chuyến đi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (journeyId) {
      loadJourney();
    }
  }, [journeyId, userId]);

  // Fetch place data for all stops
  useEffect(() => {
    const fetchPlacesForStops = async () => {
      if (!currentDay?.stops || currentDay.stops.length === 0) {
        setStopsWithPlaces([]);
        return;
      }

      try {
        const stopsWithPlaceData: StopWithPlace[] = await Promise.all(
          currentDay.stops.map(async (stop) => {
            try {
              const place = await PlacesService.findOne(stop.place_id);
              return { ...stop, place };
            } catch (error) {
              console.warn(`[JourneyTrackingScreen] Failed to fetch place ${stop.place_id}:`, error);
              return stop as StopWithPlace;
            }
          })
        );
        setStopsWithPlaces(stopsWithPlaceData);
      } catch (error) {
        console.error('[JourneyTrackingScreen] Error fetching places:', error);
      }
    };

    fetchPlacesForStops();
  }, [currentDay?.stops]);

  // Request location permission and start tracking
  useEffect(() => {
    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Lỗi', 'Cần cấp quyền truy cập vị trí');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(loc.coords);
      } catch (error) {
        console.error('[JourneyTrackingScreen] Error getting location:', error);
      }
    };

    startLocationTracking();
  }, []);

  // Fetch route from ORS when stops change
  useEffect(() => {
    if (stopsWithPlaces.length < 2) return;

    const fetchRoute = async () => {
      try {
        setIsLoadingRoute(true);

        // Extract coordinates from places
        const stopCoords: RouteCoordinate[] = stopsWithPlaces
          .filter((stop) => stop.place?.location?.coordinates)
          .map((stop) => ({
            latitude: stop.place!.location.coordinates[1],
            longitude: stop.place!.location.coordinates[0],
          }));

        if (stopCoords.length < 2) {
          console.warn('[JourneyTrackingScreen] Not enough place data with coordinates');
          return;
        }

        const routeData = await fetchCompleteRoute(stopCoords, travelMode);
        setRouteCoordinates(routeData.allCoordinates);

        // Auto-snap to 50% when route loads
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Animated.spring(pan, {
          toValue: TRANSLATE_Y_SNAPS[1],
          useNativeDriver: false,
          friction: 8,
        }).start();

        // Fit map to route
        if (routeData.allCoordinates.length > 0) {
          mapRef.current?.fitToCoordinates(routeData.allCoordinates, {
            edgePadding: { top: 80, right: 80, bottom: SNAP_POINTS[1] + 40, left: 80 },
            animated: true,
          });
        }
      } catch (error) {
        console.error('[JourneyTrackingScreen] Error fetching route:', error);
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [stopsWithPlaces, travelMode]);

  // Handle check-in
  const handleCheckIn = async (method: 'camera' | 'qr' = 'qr') => {
    if (!journey || !currentDay) return;

    const currentStop = stopsWithPlaces[currentStopIndex];
    if (!currentStop) {
      Alert.alert('Lỗi', 'Không tìm thấy điểm dừng');
      return;
    }

    try {
      setIsCheckingIn(true);
      const dayId = currentDay.id;
      const stopId = currentStop._id;

      if (method === 'camera') {
        // Camera check-in (for host)
        await JourneyService.checkInStop(journeyId, dayId, stopId, {
          check_in_image: 'image_url_here',
        });
      } else {
        // QR check-in (for members)
        await JourneyService.checkInStop(journeyId, dayId, stopId, {});
      }

      Alert.alert('Thành công', 'Check-in đã được ghi nhận');
      
      // Reload data to reflect changes
      await loadJourney();
      
      // Auto move to next stop if host checks in successfully
      if (isHost && currentStopIndex < stopsWithPlaces.length - 1) {
        setCurrentStopIndex(currentStopIndex + 1);
      }
    } catch (error) {
      console.error('[handleCheckIn] Error:', error);
      Alert.alert('Lỗi', 'Check-in không thành công. Trưởng nhóm cần check-in trước.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleMemberScanQR = () => {
    setShowScannerModal(true);
  };

const handleShowCheckInProgress = async () => {
    if (!journey || !currentDay) return;
    
    const currentStop = stopsWithPlaces[currentStopIndex];
    if (!currentStop) return;

    try {
      setIsFetchingProgress(true);
      // 1. Lấy dữ liệu gốc từ Backend
      const data = await JourneyService.getCheckInStatus(journeyId, currentDay.id, currentStop._id);

      // 2. Viết hàm tiện ích để quét và bổ sung dữ liệu user bị thiếu
      const augmentMembersWithProfile = async (memberList: any[]) => {
        if (!memberList || !Array.isArray(memberList)) return [];

        return await Promise.all(memberList.map(async (member) => {
          // Kiểm tra xem backend đã có sẵn tên chưa
          const hasName = member.user_name || member.name || member.user?.name || member.user?.user_name;
          const targetId = member.user_id || member.id || member._id;

          // Nếu KHÔNG CÓ TÊN nhưng CÓ ID, ta gọi UserService để đắp vào
          if (!hasName && targetId) {
            try {
              const profile = await UsersService.getPublicProfile(targetId);
              return {
                ...member,
                user_name: profile.fullName,
                user_avatar: profile.avatar,
              };
            } catch (err) {
              console.warn(`[JourneyTrackingScreen] Lỗi khi tải profile user ${targetId}`, err);
              // Nếu lỗi (vd user bị xóa), vẫn giữ nguyên dữ liệu cũ
              return member; 
            }
          }
          
          return member; // Đã có đủ dữ liệu, không cần gọi API
        }));
      };

      // 3. Thực thi đắp dữ liệu cho cả 2 danh sách chạy song song
      const [augmentedCheckInList, augmentedPendingList] = await Promise.all([
        augmentMembersWithProfile(data.check_in_list),
        augmentMembersWithProfile(data.pending_list)
      ]);

      // 4. Lưu dữ liệu đã hoàn thiện vào state và mở Modal
      setCheckInData({
        ...data,
        check_in_list: augmentedCheckInList,
        pending_list: augmentedPendingList,
      });
      
      setShowProgressModal(true);

    } catch (error) {
      console.error('[handleShowCheckInProgress] Error:', error);
      Alert.alert("Lỗi", "Không thể lấy thông tin tiến độ điểm danh");
    } finally {
      setIsFetchingProgress(false);
    }
  };

  const currentStop = stopsWithPlaces[currentStopIndex];
  const isCurrentStopArrived = currentStop?.status === StopStatus.ARRIVED;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScreenHeader
        title={journey?.name || 'Theo dõi chuyến đi'}
        onBack={onBack}
        horizontalPadding={16}
        topPadding={8}
        bottomPadding={12}
        titleSize={17}
        titleWeight="700"
        containerStyle={{ zIndex: 10 }}
        rightSlot={
          <Button style={styles.headerBtn}>
            <MoreVertical color="#111827" size={24} />
          </Button>
        }
      />

      <View style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Map View */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={
            stopsWithPlaces.length > 0 && stopsWithPlaces[0].place?.location?.coordinates
              ? {
                  latitude: stopsWithPlaces[0].place.location.coordinates[1],
                  longitude: stopsWithPlaces[0].place.location.coordinates[0],
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : {
                  latitude: 21.0285,
                  longitude: 105.8542,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
          }
        >
          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#3B82F6"
              strokeWidth={5}
              lineDashPattern={[0]}
              lineCap="round"
            />
          )}

          {/* Stop Markers */}
          {stopsWithPlaces.map((stop, index) => {
            if (!stop.place?.location?.coordinates) return null;
            return (
              <Marker
                key={stop._id}
                coordinate={{
                  latitude: stop.place.location.coordinates[1],
                  longitude: stop.place.location.coordinates[0],
                }}
                title={stop.place.name}
                description={stop.place.description}
                pinColor={index === currentStopIndex ? '#3B82F6' : '#9CA3AF'}
              />
            );
          })}

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              flat
              anchor={{ x: 0.5, y: 0.5 }}
              rotation={userLocation.heading || 0}
            >
              <View style={styles.userMarker}>
                <Navigation size={20} color="#3B82F6" fill="#3B82F6" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Multi-Snap Bottom Panel */}
        <Animated.View
          style={[styles.bottomPanel, { transform: [{ translateY: pan }] }]}
        >
          <View style={styles.dragHandleWrapper} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            <View style={{ paddingHorizontal: 20 }}>
              {/* Current Stop Info */}
              {currentStop && currentStop.place && (
                <>
                  <View style={styles.stopInfoContainer}>
                    <MapPin size={20} color="#3B82F6" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.stopTitle}>{currentStop.place.name}</Text>
                      <Text style={styles.stopDescription}>{currentStop.place.description}</Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.singleStatCard}>
                    <View style={styles.statItem}>
                      <Clock size={18} color="#EF4444" />
                      <Text style={styles.statLabel}>Dự kiến</Text>
                    </View>
                    <Text style={styles.statValue}>
                      {currentStop.end_time || '---'}
                    </Text>
                  </View>

                  {/* Check-in Controls */}
                  <View style={styles.checkinContainer}>
                    <Text style={styles.sectionTitle}>Check-in tại điểm này</Text>

                    {isHost ? (
                      <View style={styles.hostControls}>
                        <Button
                          style={[
                            styles.hostCheckInBtn,
                            isCurrentStopArrived && styles.hostCheckInBtnSuccess
                          ]}
                          onPress={() => handleCheckIn('camera')}
                          disabled={isCurrentStopArrived || isCheckingIn}
                        >
                          {isCheckingIn ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : isCurrentStopArrived ? (
                            <CheckCircle size={20} color="#fff" />
                          ) : (
                            <Camera size={20} color="#fff" />
                          )}
                          <Text style={styles.hostCheckInBtnText}>
                            {isCurrentStopArrived ? 'Bạn đã Check-in' : 'Trưởng nhóm Check-in'}
                          </Text>
                        </Button>

                        <Button
                          style={[
                            styles.qrBtn,
                            !isCurrentStopArrived && styles.qrBtnDisabled
                          ]}
                          onPress={() => {
                            if (!isCurrentStopArrived) {
                              Alert.alert('Lưu ý', 'Trưởng nhóm cần check-in trước khi tạo mã QR cho các thành viên.');
                              return;
                            }
                            setShowQRModal(true);
                          }}
                          activeOpacity={!isCurrentStopArrived ? 1 : 0.7}
                        >
                          <QrCode size={20} color={isCurrentStopArrived ? '#3B82F6' : '#9CA3AF'} />
                          <Text style={[
                            styles.qrBtnText,
                            !isCurrentStopArrived && styles.qrBtnTextDisabled
                          ]}>
                            Hiện mã QR cho nhóm
                          </Text>
                        </Button>

                        <Button
                            style={styles.progressBtn}
                            onPress={handleShowCheckInProgress}
                            disabled={isFetchingProgress}
                          >
                            {isFetchingProgress ? (
                              <ActivityIndicator size="small" color="#4B5563" />
                            ) : (
                              <Users size={20} color="#4B5563" />
                            )}
                            <Text style={styles.progressBtnText}>
                              Xem tiến độ điểm danh nhóm
                            </Text>
                          </Button>
                      </View>
                      ) : (
                      <Button
                        style={[
                          styles.memberCheckInBtn,
                          !isCurrentStopArrived && { backgroundColor: '#9CA3AF' }
                        ]}
                        onPress={() => {
                          if (!isCurrentStopArrived) {
                            Alert.alert(
                              'Chưa thể Check-in', 
                              'Vui lòng đợi Trưởng nhóm check-in tại địa điểm này trước khi bạn có thể quét mã.'
                            );
                            return;
                          }
                          handleMemberScanQR(); // Trưởng nhóm checkin rồi mới gọi hàm mở Camera
                        }}
                        activeOpacity={!isCurrentStopArrived ? 1 : 0.7}
                      >
                        <QrCode size={20} color="#fff" />
                        <Text style={styles.memberCheckInBtnText}>
                          {!isCurrentStopArrived ? 'Đợi Trưởng nhóm Check-in...' : 'Quét mã QR checkin'}
                        </Text>
                      </Button>
                    )}
                  </View>

                  {/* Stops List */}
                  {stopsWithPlaces.length > 1 && (
                    <View style={styles.stopsListContainer}>
                      <Text style={styles.sectionTitle}>Danh sách điểm dừng</Text>
                      {stopsWithPlaces.map((stop, index) => (
                        <TouchableOpacity
                          key={stop._id}
                          style={[
                            styles.stopListItem,
                            index === currentStopIndex && styles.stopListItemActive,
                          ]}
                          onPress={() => setCurrentStopIndex(index)}
                        >
                          <View
                            style={[
                              styles.stopListItemDot,
                              index === currentStopIndex && styles.stopListItemDotActive,
                            ]}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.stopListItemTitle,
                                index === currentStopIndex &&
                                  styles.stopListItemTitleActive,
                              ]}
                            >
                              {stop.place?.name || 'Chưa rõ'}
                            </Text>
                            <Text style={styles.stopListItemStatus}>
                              {stop.status || 'PENDING'}
                            </Text>
                          </View>
                          {index === currentStopIndex && (
                            <Navigation size={16} color="#3B82F6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* QR Check-in Modal */}
      {journey && currentDay && currentStop && currentStop.place && (
        <QRCheckInModal
          visible={showQRModal}
          journeyId={journeyId}
          dayId={currentDay.id}
          stopId={currentStop._id}
          userId={userId}
          stopName={currentStop.place.name}
          onClose={() => setShowQRModal(false)}
          onTokenGenerated={(token) => {
            console.log('[JourneyTrackingScreen] Token generated:', token);
          }}
        />
      )}
      <CheckInProgressModal 
        visible={showProgressModal}
        data={checkInData}
        onClose={() => setShowProgressModal(false)}
      />
      <MemberScannerModal
          visible={showScannerModal}
          currentJourneyId={journeyId}
          currentStopId={currentStop._id}
          onClose={() => setShowScannerModal(false)}
          onScanSuccess={() => {
            setShowScannerModal(false);
            // Mã đúng và còn hạn, chính thức cho phép gọi API có sẵn của backend
            handleCheckIn('qr'); 
          }}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBtn: {
    padding: 4,
  },
  userMarker: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Multi-snap bottom panel
  bottomPanel: {
    position: 'absolute',
    top: SCREEN_HEIGHT - SNAP_POINTS[0],
    height: SCREEN_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    elevation: 25,
    shadowOpacity: 0.15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  dragHandle: {
    width: 50,
    height: 6,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
  },

  // Stop Info
  stopInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stopDescription: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Stats
  singleStatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  // Check-in
  checkinContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  hostControls: {
    gap: 10,
  },
  hostCheckInBtn: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  hostCheckInBtnSuccess: {
    backgroundColor: '#10B981',
  },
  hostCheckInBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  qrBtn: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  qrBtnDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  qrBtnText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  qrBtnTextDisabled: {
    color: '#9CA3AF',
  },
  progressBtn: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  progressBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  memberCheckInBtn: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  memberCheckInBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Stops List
  stopsListContainer: {
    marginTop: 20,
  },
  stopListItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stopListItemActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
  },
  stopListItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  stopListItemDotActive: {
    backgroundColor: '#3B82F6',
  },
  stopListItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stopListItemTitleActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  stopListItemStatus: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});