import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { BottomTabBar, MainTab } from './BottomTabBar';
import { AppHeader } from './AppHeader';

// API Imports
import { PlacesService } from '../services/placeService/place.service';
import { JourneyService } from '../services/journeyService/journey.service';
import { Place, PlaceCategory } from '../services/placeService/place.type';
import { Journey, JourneyTag } from '../services/journeyService/journey.type';

type PlaceFilterLabel = 'All' | 'Nhà hàng' | 'Khách sạn' | 'Thắng cảnh' | 'Bar';
type TourFilterLabel = 'All' | 'Chill' | 'Ẩm thực' | 'Phượt' | 'Thương mại';

const PLACE_FILTERS: PlaceFilterLabel[] = ['All', 'Nhà hàng', 'Khách sạn', 'Thắng cảnh', 'Bar'];
const TOUR_FILTERS: TourFilterLabel[] = ['All', 'Chill', 'Ẩm thực', 'Phượt', 'Thương mại'];

const PLACE_CATEGORY_MAP: Record<PlaceFilterLabel, PlaceCategory | undefined> = {
    All: undefined,
    'Nhà hàng': PlaceCategory.RESTAURANT,
    'Khách sạn': PlaceCategory.HOTEL,
    'Thắng cảnh': PlaceCategory.SIGHTSEEING,
    Bar: PlaceCategory.BAR_PUB,
};

const TOUR_TAG_MAP: Record<TourFilterLabel, JourneyTag | undefined> = {
    All: undefined,
    Chill: JourneyTag.CHILL,
    'Ẩm thực': JourneyTag.FOODIE,
    'Phượt': JourneyTag.ADVENTURE,
    'Thương mại': JourneyTag.CITY,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDistance = (distance?: number) => {
    if (!distance || Number.isNaN(distance)) {
        return 'N/A';
    }
    return `${(distance / 1000).toFixed(1)} km`;
};

const getTripDuration = (journey: Journey) => {
    const start = new Date(journey.start_date).getTime();
    const end = new Date(journey.end_date).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
        return `${journey.days?.length || 0} ngày`;
    }
    return `${Math.max(1, Math.round((end - start) / DAY_MS) + 1)} ngày`;
};

const getTripStatusText = (journey: Journey) => {
    const now = Date.now();
    const start = new Date(journey.start_date).getTime();
    if (!Number.isNaN(start) && start > now) {
        const daysLeft = Math.ceil((start - now) / DAY_MS);
        return `Diễn ra trong ${daysLeft} ngày`;
    }
    return 'Đang diễn ra';
};

const normalizeJourneyList = (payload: unknown): Journey[] => {
    if (Array.isArray(payload)) {
        return payload as Journey[];
    }
    if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: Journey[] }).data;
    }
    return [];
};

const normalizePlaceList = (payload: unknown): Place[] => {
    if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: Place[] }).data;
    }
    if (Array.isArray(payload)) {
        return payload as Place[];
    }
    return [];
};

const StarRating = ({ rating, total = 5 }: { rating: number; total?: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
            <Svg key={i} width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 1 }}>
                <Polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill={i < Math.floor(rating) ? '#FBBF24' : '#E5E7EB'}
                    stroke={i < Math.floor(rating) ? '#FBBF24' : '#E5E7EB'}
                    strokeWidth="1"
                />
            </Svg>
        ))}
        <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600', marginLeft: 4 }}>{rating}</Text>
    </View>
);

export const HomeScreen = ({
    activeNavTab = 'home',
    onTabChange,
    onOpenProfile,
    onCreateTrip,
    onTripClick,
    onLogout,
}: {
    activeNavTab?: MainTab;
    onTabChange?: (tab: MainTab) => void;
    onOpenProfile?: () => void;
    onCreateTrip?: () => void;
    onTripClick?: (tripId: string) => void;
    onLogout?: () => void;
}) => {
    const [searchText, setSearchText] = useState('');
    const [activeFilter, setActiveFilter] = useState<PlaceFilterLabel>('All');
    const [activeTourFilter, setActiveTourFilter] = useState<TourFilterLabel>('All');

    // Data State
    const [myTrips, setMyTrips] = useState<Journey[]>([]);
    const [joinTours, setJoinTours] = useState<Journey[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHomeData = async (filterCategory: PlaceFilterLabel, tourFilter: TourFilterLabel) => {
        try {
            setIsLoading(true);
            const category = PLACE_CATEGORY_MAP[filterCategory];
            const tourTag = TOUR_TAG_MAP[tourFilter];

            const [journeysRes, placesRes, publicRes] = await Promise.allSettled([
                JourneyService.findMy(),
                PlacesService.findAll({ limit: 10, category }),
                JourneyService.getPublicFeed({ tag: tourTag, maxPrice: 3000000 }),
            ]);

            if (journeysRes.status === 'fulfilled') {
                setMyTrips(normalizeJourneyList(journeysRes.value));
            }
            if (placesRes.status === 'fulfilled') {
                setPlaces(normalizePlaceList(placesRes.value));
            }
            if (publicRes.status === 'fulfilled') {
                setJoinTours(normalizeJourneyList(publicRes.value));
            }

        } catch (error) {
            console.error('Home data load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData(activeFilter, activeTourFilter);
    }, [activeFilter, activeTourFilter]);

    const filteredPlaces = places.filter((place) => {
        if (!searchText.trim()) {
            return true;
        }
        return place.name.toLowerCase().includes(searchText.trim().toLowerCase());
    });


    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-[#F5F6FA]">
            <AppHeader onOpenProfile={onOpenProfile ?? (() => { })} onLogout={onLogout ?? (() => { })} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
                {/* Weather Card */}
                <View className="px-5 mb-5 mt-2">
                    <View className="rounded-[20px] overflow-hidden" style={{ height: 160 }}>
                        <ImageBackground
                            source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />

                            <View className="p-4 flex-1 justify-between">
                                <Text className="text-white text-[13px] font-semibold">Dự báo hôm nay: Có mây</Text>

                                <View className="flex-row items-end justify-between">
                                    <View>
                                        <View className="flex-row items-end">
                                            <Text className="text-white text-[48px] font-bold leading-none">36</Text>
                                            <Text className="text-white text-[20px] font-bold mb-2 ml-1">°C</Text>
                                            <Text className="text-white text-[16px] font-bold mb-2 ml-3">Trời nắng</Text>
                                        </View>
                                        <Text className="text-white text-[13px] font-medium mt-1">Cầu Giấy, Hà Nội</Text>
                                        <Text className="text-white text-[13px] font-medium mt-1">Thích hợp để ra ngoài</Text>
                                    </View>

                                    <View className="items-end">
                                        <View className="bg-black/30 px-3 py-1.5 rounded-lg mb-2 border border-white/10">
                                            <Text className="text-white text-[11px] font-medium">Độ ẩm: --</Text>
                                        </View>
                                        <View className="bg-black/30 px-3 py-1.5 rounded-lg mb-2 border border-white/10">
                                            <Text className="text-white text-[11px] font-medium">Sức gió: --</Text>
                                        </View>
                                        <View className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                                            <Text className="text-white text-[11px] font-medium">Some stat i dunno: --</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                </View>

                {/* Tao ke hoach moi */}
                <View className="px-5 mb-8">
                    <TouchableOpacity
                        className="bg-[#EBF5FF] rounded-2xl p-4 flex-row items-center"
                        activeOpacity={0.8}
                        onPress={onCreateTrip}
                    >
                        <View
                            className="items-center justify-center mr-4"
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                backgroundColor: '#2B8EF0',
                            }}
                        >
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 5v14M5 12h14"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </Svg>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 text-[16px]" style={{ fontWeight: '700' }}>
                                Tạo kế hoạch mới
                            </Text>
                            <Text className="text-[#3b82f6] text-[13px] mt-0.5 max-w-[90%] font-medium">
                                Sử dụng AI để tối ưu lịch trình của bạn ngay!
                            </Text>
                        </View>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M9 18l6-6-6-6"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* Khám phá địa điểm Section */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between px-5 mb-3">
                        <Text className="text-gray-900 text-[18px] font-bold">Khám phá địa điểm</Text>
                        <TouchableOpacity className="bg-[#2B8EF0] px-3 py-1.5 rounded-lg">
                            <Text className="text-white text-[13px] font-semibold">Xem thêm</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 pl-5" contentContainerStyle={{ paddingRight: 20 }}>
                        {PLACE_FILTERS.map(chip => {
                            const isActive = activeFilter === chip;
                            return (
                                <TouchableOpacity
                                    key={chip}
                                    activeOpacity={0.8}
                                    onPress={() => setActiveFilter(chip)}
                                    className={`px-4 py-1.5 rounded-full mr-2 ${isActive ? 'bg-[#DCFCE7]' : 'bg-gray-100 border border-gray-200'}`}
                                >
                                    <Text className={`text-[13px] ${isActive ? 'text-[#16A34A] font-bold' : 'text-gray-600 font-medium'}`}>
                                        {chip}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View className="px-5 mb-4">
                        <View className="flex-row items-center bg-gray-100/80 px-4 py-2.5 rounded-[20px]">
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
                                <Path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                            <TextInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Tìm địa điểm..."
                                placeholderTextColor="#6B7280"
                                className="flex-1 text-[14px] text-gray-900 py-1"
                            />
                        </View>
                    </View>

                    {isLoading ? (
                        <View className="items-center py-4">
                            <ActivityIndicator size="small" color="#2B8EF0" />
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5" contentContainerStyle={{ paddingRight: 20 }}>
                            {filteredPlaces.map(place => (
                                <TouchableOpacity key={place._id} className="w-[160px] mr-4 bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm">
                                    <Image source={{ uri: place.images?.[0] || 'https://via.placeholder.com/400' }} className="w-full h-[100px]" />
                                    <View className="px-3 py-3">
                                        <Text className="text-gray-900 text-[14px] font-bold mb-1" numberOfLines={1}>{place.name}</Text>
                                        <StarRating rating={place.rating || 0} />
                                        <View className="flex-row items-center mt-2 justify-between">
                                            <View className="flex-row items-center">
                                                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-1">
                                                    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#6B7280" />
                                                </Svg>
                                                <Text className="text-gray-500 text-[12px]">{formatDistance(place.distance)}</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-1">
                                                    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                                    <Circle cx="9" cy="7" r="4" stroke="#6B7280" strokeWidth="1.5" />
                                                </Svg>
                                                <Text className="text-gray-500 text-[12px]">{place.reviewCount || 0}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Tham gia tour */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between px-5 mb-3">
                        <Text className="text-gray-900 text-[18px] font-bold">Tham gia tour</Text>
                        <TouchableOpacity className="bg-[#2B8EF0] px-3 py-1.5 rounded-lg">
                            <Text className="text-white text-[13px] font-semibold">Xem thêm</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 pl-5" contentContainerStyle={{ paddingRight: 20 }}>
                        {TOUR_FILTERS.map((chip) => {
                            const isActive = chip === activeTourFilter;
                            return (
                                <TouchableOpacity
                                    key={chip}
                                    activeOpacity={0.8}
                                    onPress={() => setActiveTourFilter(chip)}
                                    className={`px-4 py-1.5 rounded-full mr-2 ${isActive ? 'bg-[#DCFCE7]' : 'bg-gray-100 border border-gray-200'}`}
                                >
                                    <Text className={`text-[13px] ${isActive ? 'text-[#16A34A] font-bold' : 'text-gray-600 font-medium'}`}>
                                        {chip}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View className="px-5 mb-3">
                        <View className="flex-row items-center bg-gray-100/80 px-4 py-2.5 rounded-[20px]">
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
                                <Path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                            <Text className="flex-1 text-[14px] text-gray-500 py-1">Nhập tên hoặc Mã mời...</Text>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5" contentContainerStyle={{ paddingRight: 20 }}>
                        {joinTours.map((tour) => (
                            <TouchableOpacity key={tour._id} activeOpacity={0.85} className="w-[210px] mr-3 bg-white rounded-[20px] p-2.5 border border-gray-200">
                                <Image source={{ uri: tour.avatar || 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80' }} className="w-full h-[110px] rounded-xl" />
                                <Text className="text-gray-900 text-[18px] font-bold mt-2" numberOfLines={1}>{tour.name}</Text>
                                <View className="flex-row items-center mt-1 justify-between">
                                    <Text className="text-[#2B8EF0] text-[11px] font-medium" numberOfLines={1}>Mã tour: {tour.invite_code || 'N/A'}</Text>
                                    <Text className="text-[#2B8EF0] text-[11px] font-medium">{tour.members?.length || 0}/18</Text>
                                </View>
                                <View className="flex-row items-center mt-1">
                                    <Text className="text-[#EF4444] text-[11px] font-medium">{getTripStatusText(tour)}</Text>
                                </View>

                                <View className="flex-row items-center mt-2">
                                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
                                        <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#111827" strokeWidth="1.7" />
                                        <Path d="M16 2v4M8 2v4M3 10h18" stroke="#111827" strokeWidth="1.7" strokeLinecap="round" />
                                    </Svg>
                                    <Text className="text-gray-700 text-[12px]">{new Date(tour.start_date).toLocaleDateString('vi-VN')} - {new Date(tour.end_date).toLocaleDateString('vi-VN')}</Text>
                                </View>

                                <View className="mt-2 flex-row items-center justify-between">
                                    <Text className="text-[#F59E0B] text-[18px] font-bold">{(tour.cost_per_person || 0).toLocaleString('vi-VN')}đ/người</Text>
                                    <TouchableOpacity className="bg-[#2B8EF0] rounded-lg px-4 py-2" activeOpacity={0.85}>
                                        <Text className="text-white text-[13px] font-bold">Tham gia</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {joinTours.length === 0 && (
                            <View className="w-[220px] bg-white rounded-2xl p-4 border border-gray-200">
                                <Text className="text-gray-700 text-[13px]">Chưa có tour phù hợp bộ lọc hiện tại.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Chuyến đi của bạn Section */}
                <View className="px-5 mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-900 text-[18px] font-bold">Chuyến đi của bạn</Text>
                        <TouchableOpacity className="bg-[#2B8EF0] px-3 py-1.5 rounded-lg">
                            <Text className="text-white text-[13px] font-semibold">Xem thêm</Text>
                        </TouchableOpacity>
                    </View>

                    {myTrips.map(trip => {
                        const tripId = trip._id;
                        return (
                            <TouchableOpacity key={tripId} className="bg-white rounded-[20px] mb-3 flex-row p-2.5 border border-[#F3F4F6] shadow-sm" onPress={() => onTripClick?.(tripId)}>
                                <View className="relative w-[110px] h-[110px]">
                                    <Image source={{ uri: trip.avatar || 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80' }} className="w-full h-full rounded-xl" />
                                    <View className="absolute top-2 left-2 bg-[#2B8EF0] px-2 py-0.5 rounded-full">
                                        <Text className="text-white text-[10px] font-bold">{trip.visibility || 'Tùy chọn'}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 ml-3 py-1 flex-col justify-between">
                                    <View className="flex-row justify-between items-start">
                                        <Text className="text-gray-900 text-[15px] font-bold flex-1 pr-2" numberOfLines={2}>{trip.name}</Text>
                                        <TouchableOpacity>
                                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                                <Circle cx="5" cy="12" r="1.5" fill="#9CA3AF" />
                                                <Circle cx="12" cy="12" r="1.5" fill="#9CA3AF" />
                                                <Circle cx="19" cy="12" r="1.5" fill="#9CA3AF" />
                                            </Svg>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row items-center mt-1">
                                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-1">
                                            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#6B7280" />
                                        </Svg>
                                        <Text className="text-gray-500 text-[11px]" numberOfLines={1}>{trip.days?.length ? `${trip.days.length} điểm dừng` : 'Nhiều điểm dừng'}</Text>
                                    </View>

                                    <View className="mt-2 self-start border border-[#2B8EF0] rounded-full px-3 py-1">
                                        <Text className="text-[#2B8EF0] text-[11px] font-medium">{getTripStatusText(trip)}</Text>
                                    </View>

                                    <View className="flex-row items-center mt-2">
                                        <View className="flex-row items-center mr-3">
                                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="mr-1.5">
                                                <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#2B8EF0" strokeWidth="1.5" />
                                                <Path d="M16 2v4M8 2v4M3 10h18" stroke="#2B8EF0" strokeWidth="1.5" strokeLinecap="round" />
                                            </Svg>
                                            <Text className="text-gray-600 text-[12px] font-medium">{getTripDuration(trip)}</Text>
                                        </View>
                                        {trip.tags && trip.tags.length > 0 && (
                                            <View className="flex-row items-center flex-1">
                                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="mr-1.5 min-w-[14px]">
                                                    <Circle cx="12" cy="12" r="9" stroke="#22C55E" strokeWidth="1.5" />
                                                    <Path d="M12 5L9 12h6L12 5z" fill="#22C55E" />
                                                </Svg>
                                                <Text className="text-gray-600 text-[12px] font-medium" numberOfLines={1}>
                                                    {trip.tags[0]}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Khác */}
                <View className="px-5 mb-8">
                    <Text className="text-gray-900 text-[18px] font-bold mb-3">Khác</Text>
                    <View className="flex-row" style={{ gap: 12 }}>
                        <View className="flex-1 bg-white rounded-2xl overflow-hidden border border-gray-200">
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1496483648148-47c686dc86a8?auto=format&fit=crop&w=800&q=80' }}
                                style={{ width: '100%', height: 110 }}
                            />
                            <View className="p-3 items-center">
                                <Text className="text-gray-800 text-[16px] font-bold text-center">Đánh giá địa điểm</Text>
                                <Text className="text-gray-500 text-[12px] text-center mt-1">Để lại đánh giá của bạn sau mỗi chuyến đi</Text>
                                <TouchableOpacity className="mt-3 bg-[#2B8EF0] px-5 py-2 rounded-lg">
                                    <Text className="text-white text-[13px] font-bold">Xem thêm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-1 bg-white rounded-2xl overflow-hidden border border-gray-200">
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }}
                                style={{ width: '100%', height: 110 }}
                            />
                            <View className="p-3 items-center">
                                <Text className="text-gray-800 text-[16px] font-bold text-center">Cộng đồng</Text>
                                <Text className="text-gray-500 text-[12px] text-center mt-1">Tham gia cộng đồng những người yêu thích du lịch</Text>
                                <TouchableOpacity className="mt-3 bg-[#2B8EF0] px-5 py-2 rounded-lg">
                                    <Text className="text-white text-[13px] font-bold">Xem thêm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <BottomTabBar
                activeTab={activeNavTab}
                onTabPress={(tab: MainTab) => {
                    onTabChange?.(tab);
                    if (tab === 'profile') {
                        onOpenProfile?.();
                    }
                }}
            />
        </SafeAreaView>
    );
};
