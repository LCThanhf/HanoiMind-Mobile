import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert,
    Linking,
    Share,
    LayoutAnimation,
    Platform,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { PlacesService } from '../services/placeService/place.service';
import { Place } from '../services/placeService/place.type';
import { FavoriteService } from '../services/favoriteService/favorite.service';
import { FavoriteType } from '../services/favoriteService/favorite.type';
import { ReviewService } from '../services/reviewService/review.service';
import ChatService from '../services/chatService/chat.service';
import { UsersService } from '../services/userService/user.service';
import { BackChevronIcon, Button, CharacteristicBadge, ListActionRow } from './shared';

const COST_RATES = {
    dining: { RESTAURANT: 150000, CAFE: 70000, STREET_FOOD: 40000 },
    activities: { SIGHTSEEING: 150000, HIKING: 200000, TOUR: 500000, ADVENTURE: 800000, WELLNESS: 250000, DEFAULT: 100000 },
};

const getPriceMultiplier = (level: number) => {
    const multipliers: Record<number, number> = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0 };
    return multipliers[level] || 1.0;
};

const getHighResCloudinary = (url: string | undefined) => {
    if (!url) return 'https://via.placeholder.com/800';
    if (url.includes('res.cloudinary.com')) {
        return url.replace('/upload/', '/upload/f_auto,q_auto:best,w_800,dpr_3.0/');
    }
    return url;
};

const getAvatarUrl = (url: string | undefined) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.includes('res.cloudinary.com')) {
        return url.replace('/upload/', '/upload/f_auto,q_auto:best,w_300,dpr_3.0,c_fill,g_face/');
    }
    return url;
};

const MapPinIcon = ({ color = '#6B7280' }) => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </Svg>
);

const StarIcon = ({ color = '#475569' }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
);

const MessageCircleIcon = ({ color = '#3B82F6' }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Svg>
);

const ExternalLinkIcon = ({ color = '#3B82F6' }) => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </Svg>
);

const CheckCircleIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

const TagIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <Path d="M7 7h.01" />
    </Svg>
);

type PlaceDetailScreenProps = {
    onBack: () => void;
    onReview?: () => void;
    onOpenMap?: (place: Place) => void;
    onStartChat?: (roomId: string, chatName: string) => void;
    placeId: string;
    refreshKey?: number;
};

export const PlaceDetailScreen = ({ onBack, onReview, onOpenMap, onStartChat, placeId, refreshKey = 0 }: PlaceDetailScreenProps) => {
    const insets = useSafeAreaInsets();
    const [place, setPlace] = useState<Place | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAllHours, setShowAllHours] = useState(false);
    const [ownerName, setOwnerName] = useState<string>('');

    const fetchPlaceDetail = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);

            const [response, reviewsRes, myFavs] = await Promise.all([
                PlacesService.findOne(placeId),
                ReviewService.findAllByPlace(placeId, { limit: 100, sort_order: 'DESC' }),
                FavoriteService.getMyFavorites(FavoriteType.PLACE).catch(() => []),
            ]);

            const data = (response as any).data || response;
            const fetchedReviews = reviewsRes.data || [];
            const totalReviews = reviewsRes.meta?.total || fetchedReviews.length;

            let avgRating = data.rating;
            if (fetchedReviews.length > 0) {
                const totalScore = fetchedReviews.reduce((sum: number, review: any) => {
                    return sum + (review.criteria?.cleanliness || review.rating || 0);
                }, 0);
                avgRating = Number((totalScore / fetchedReviews.length).toFixed(1));
            }

            setPlace({ ...data, rating: avgRating, reviewCount: totalReviews });
            setIsFavorite(myFavs.some((fav: any) => fav.target_id === placeId || fav._id === placeId));

            // Fetch owner name
            const ownerId = data?.ownerId || (data as any)?.owner_id;
            if (ownerId) {
                try {
                    const ownerProfile = await UsersService.getPublicProfile(ownerId);
                    setOwnerName(ownerProfile?.fullName || '');
                } catch (error) {
                    console.error('Error fetching owner profile:', error);
                    setOwnerName('');
                }
            }
        } catch (error) {
            console.error('PlaceDetailScreen: Error loading place detail for placeId:', placeId, error);
            Alert.alert('Lỗi', 'Không thể tải thông tin địa điểm.');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [placeId]);

    useEffect(() => {
        if (refreshKey === 0) {
            fetchPlaceDetail(true);
        } else {
            fetchPlaceDetail(false);
        }
    }, [fetchPlaceDetail, refreshKey]);

    const handleToggleFavorite = async () => {
        const previousState = isFavorite;
        try {
            setIsFavorite(!previousState);
            const result = await FavoriteService.toggle({ target_id: placeId, type: FavoriteType.PLACE });
            setIsFavorite(result.status === 'LIKED');
        } catch {
            setIsFavorite(previousState);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích.');
        }
    };

    const handleShare = async () => {
        if (!place) return;

        try {
            await Share.share({
                message: `Khám phá ${place.name} trên BeroTravel!\nĐịa chỉ: ${place.address}`,
                url: place.website || '',
            });
        } catch (error) {
            console.log(error);
        }
    };

    const getEstimatedPrice = () => {
        if (!place) return '0';
        if (place.estimated_cost_vnd && place.estimated_cost_vnd > 0) {
            return `${(place.estimated_cost_vnd / 1000).toLocaleString()}k`;
        }
        if (place.priceLevel === 0) return 'Miễn phí';

        const category = place.category as string;
        let basePrice = (COST_RATES.activities as any)[category] || COST_RATES.activities.DEFAULT;
        if (['RESTAURANT', 'CAFE', 'STREET_FOOD'].includes(category)) {
            basePrice = (COST_RATES.dining as any)[category] || 100000;
        }
        const estimated = basePrice * getPriceMultiplier(place.priceLevel || 1);
        return `~${(estimated / 1000).toLocaleString()}k`;
    };

    const renderCrowdLevel = (level: number = 1) => {
        const percentage = (level / 5) * 100;
        let colorClass = 'bg-success';
        let label = 'Thưa thớt';

        if (level >= 4) {
            colorClass = 'bg-red-500';
            label = 'Đông đúc';
        } else if (level >= 3) {
            colorClass = 'bg-orange-400';
            label = 'Vừa phải';
        }

        return (
            <View className="w-full">
                <View className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                    <View className={`h-full ${colorClass} rounded-full`} style={{ width: `${percentage}%` }} />
                </View>
                <Text className="text-[8px] text-slate-400 font-bold uppercase text-center">{label}</Text>
            </View>
        );
    };

    const toggleHours = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAllHours(!showAllHours);
    };

    const highResUrl = useMemo(() => getHighResCloudinary(place?.images?.[0]), [place?.images]);
    const avatarUrl = useMemo(() => getAvatarUrl(place?.images?.[0]), [place?.images]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!place) return null;

    const hasContactInfo = place.phoneNumber || place.website || place.ownerId || (place as any).owner_id;
    const rawLng = place.location?.coordinates?.[0];
    const rawLat = place.location?.coordinates?.[1];
    const safeLat = rawLat != null ? Number(rawLat) : 0;
    const safeLng = rawLng != null ? Number(rawLng) : 0;
    const hasCoordinates = Number.isFinite(safeLat) && Number.isFinite(safeLng) && !(safeLat === 0 && safeLng === 0);

    const handleContactOwner = async () => {
        const ownerId = place?.ownerId || (place as any)?.owner_id;

        if (!ownerId) {
            Alert.alert('Thông báo', 'Địa điểm này chưa có thông tin chủ sở hữu để liên hệ.');
            return;
        }

        try {
            setIsLoading(true);
            // Gọi service tạo/lấy phòng chat 1-1
            const conversation = await ChatService.createDirectChat(ownerId);

            if (onStartChat && conversation) {
                // Điều hướng sang màn hình chat với tên chủ sở hữu
                const roomId = conversation._id || (conversation as any).room_id || (conversation as any).id;
                if (!roomId) {
                    throw new Error('Không nhận được room id từ API');
                }
                onStartChat(roomId, ownerName || 'Chủ sở hữu');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kết nối với chủ sở hữu lúc này.');
            console.error('Create chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenMap = () => {
        if (onOpenMap) {
            onOpenMap(place);
            return;
        }

        if (!hasCoordinates) {
            Alert.alert('Thông báo', 'Địa điểm này chưa có tọa độ bản đồ.');
            return;
        }

        const url = Platform.select({
            ios: `maps:0,0?q=${place.name}@${safeLat},${safeLng}`,
            android: `geo:0,0?q=${safeLat},${safeLng}(${place.name})`,
        });

        if (url) {
            Linking.openURL(url).catch(() => {
                Alert.alert('Lỗi', 'Không thể mở bản đồ trên thiết bị.');
            });
        }
    };

    const mapHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { padding: 0; margin: 0; background-color: #f8fafc; }
            #map { width: 100%; height: 100vh; }
            .leaflet-control-attribution { display: none; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', {
              zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false
            }).setView([${safeLat}, ${safeLng}], 15);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            var customIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32], iconAnchor: [16, 32] });
            L.marker([${safeLat}, ${safeLng}], { icon: customIcon }).addTo(map);
          </script>
        </body>
      </html>
    `;

    return (
        <View className="flex-1 bg-slate-50">
            <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-4 pt-12 pb-4">
                <Button onPress={onBack} className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                    <BackChevronIcon size={20} color="#111827" strokeWidth={2.5} />
                </Button>

                <View className="flex-row gap-x-2">
                    <Button onPress={handleShare} className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                            <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                        </Svg>
                    </Button>

                    <Button onPress={handleToggleFavorite} className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill={isFavorite ? '#EF4444' : 'none'} stroke={isFavorite ? '#EF4444' : '#111827'} strokeWidth="2">
                            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
                        </Svg>
                    </Button>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="relative h-[280px] bg-slate-200">
                    <Image
                        source={{ uri: highResUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={300}
                        cachePolicy="memory-disk"
                        priority="high"
                        blurRadius={Platform.OS === 'ios' ? 2 : 1}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.20)',
                        }}
                    />
                    <CharacteristicBadge
                        label={place.category}
                        backgroundColor="rgba(0,0,0,0.4)"
                        textColor="#FFFFFF"
                        borderColor="rgba(255,255,255,0.2)"
                        containerStyle={{ position: 'absolute', bottom: 64, left: 20, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                        textStyle={{ fontSize: 12, textTransform: 'uppercase' }}
                    />
                </View>

                <View className="bg-white rounded-t-[32px] -mt-10 px-5 pt-16 pb-40 shadow-2xl relative">
                    <View style={styles.avatarContainer} className="w-[110px] h-[110px] rounded-full border-4 border-white bg-slate-100 overflow-hidden">
                        <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={300} />
                    </View>

                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 pr-4">
                            <Text className="text-2xl font-bold text-slate-900 leading-tight mb-1">{place.name}</Text>
                            <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider">{place.category}</Text>
                        </View>
                        <View className="items-end">
                            <View className="bg-primary-strong px-3 py-1.5 rounded-xl flex-row items-center shadow-sm">
                                <Text className="text-white font-bold text-lg">{place.rating || 'N/A'}</Text>
                            </View>
                            <Text className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold">{place.reviewCount || 0} Đánh giá</Text>
                        </View>
                    </View>

                    {place.tags && place.tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {place.tags.map((tag, index) => (
                                <CharacteristicBadge
                                    key={index}
                                    label={tag}
                                    icon={<TagIcon />}
                                    backgroundColor="#F8FAFC"
                                    textColor="#64748B"
                                    borderColor="#F1F5F9"
                                    containerStyle={{ paddingHorizontal: 10, paddingVertical: 5 }}
                                    textStyle={{ fontSize: 12, fontWeight: '500' }}
                                />
                            ))}
                        </View>
                    )}

                    <View className="flex-row justify-between bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100 items-center">
                        <View className="items-center border-r border-slate-200 pr-3 flex-1">
                            <Text className="text-[9px] text-slate-400 uppercase font-bold mb-1">Trạng thái</Text>
                            <Text className="text-sm font-bold text-success-strong">Đang mở</Text>
                        </View>
                        <View className="items-center px-3 flex-1">
                            <Text className="text-[9px] text-slate-400 uppercase font-bold mb-1">Mức giá</Text>
                            <Text className="text-sm font-bold text-slate-900">{getEstimatedPrice()}</Text>
                        </View>
                        <View className="items-center pl-3 border-l border-slate-200 flex-[1.5]">
                            <Text className="text-[9px] text-slate-400 uppercase font-bold mb-2">Độ đông</Text>
                            {renderCrowdLevel(place.crowdLevel)}
                        </View>
                    </View>

                    {place.amenities && place.amenities.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-lg font-bold text-slate-900 mb-3">Tiện nghi & Dịch vụ</Text>
                            <View className="flex-row flex-wrap gap-y-2">
                                {place.amenities.map((item, index) => (
                                    <View key={index} className="flex-row items-center w-[50%] pr-2">
                                        <CheckCircleIcon />
                                        <Text className="text-slate-600 text-sm ml-2" numberOfLines={1}>
                                            {item}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View className="mb-8">
                        <View className="flex-row justify-between items-end mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-lg font-bold text-slate-900">Vị trí</Text>
                                <View className="flex-row items-center mt-1">
                                    <MapPinIcon color="#3B82F6" />
                                    <Text className="text-slate-500 text-sm ml-1" numberOfLines={1}>
                                        {place.address}
                                    </Text>
                                </View>
                            </View>
                            <Button onPress={handleOpenMap} className="bg-primary-soft px-3 py-1.5 rounded-full">
                                <Text className="text-primary-strong text-xs font-bold">Mở bản đồ</Text>
                            </Button>
                        </View>

                        <View className="h-48 w-full rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative bg-slate-100">
                            {hasCoordinates ? (
                                <WebView
                                    originWhitelist={['*']}
                                    source={{ html: mapHtml }}
                                    style={{ flex: 1 }}
                                    scrollEnabled={false}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                />
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <ActivityIndicator color="#3B82F6" />
                                </View>
                            )}

                            <Button onPress={handleOpenMap} className="absolute bottom-3 right-3 bg-white/95 px-3 py-2 rounded-xl shadow-md flex-row items-center border border-slate-100">
                                <ExternalLinkIcon />
                                <Text className="text-[11px] font-bold text-primary-strong ml-1.5 uppercase">Xem chi tiết</Text>
                            </Button>
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-2">Giới thiệu</Text>
                        <Text className="text-slate-600 leading-relaxed text-base">{place.description}</Text>
                    </View>

                    {hasContactInfo && (
                        <View className="mb-8 bg-primary-soft/30 p-2 rounded-2xl border border-primary-border/50">
                            {(place.ownerId || (place as any).owner_id) && (
                                <ListActionRow
                                    icon={<MessageCircleIcon />}
                                    title={`Chat với ${ownerName || 'chủ cơ sở'}`}
                                    rightElement={<Text className="text-primary-strong text-xs font-bold uppercase">Nhắn tin</Text>}
                                    onPress={handleContactOwner}
                                    iconContainerBackgroundColor="#EFF6FF"
                                />
                            )}

                            {place.phoneNumber && (
                                <ListActionRow
                                    icon={
                                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                                            <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </Svg>
                                    }
                                    title={place.phoneNumber}
                                    rightElement={<Text className="text-primary-strong text-xs font-bold uppercase">Gọi điện</Text>}
                                    onPress={() => Linking.openURL('tel:' + place.phoneNumber)}
                                    iconContainerBackgroundColor="#EFF6FF"
                                />
                            )}

                            {place.website && (
                                <ListActionRow
                                    icon={
                                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                                            <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </Svg>
                                    }
                                    title={place.website.replace('https://', '')}
                                    rightElement={<Text className="text-primary-strong text-xs font-bold uppercase">Website</Text>}
                                    onPress={() => Linking.openURL(place.website || '')}
                                    iconContainerBackgroundColor="#EFF6FF"
                                    showBorderBottom={false}
                                />
                            )}
                        </View>
                    )}

                    <View className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-6">
                        <Button onPress={toggleHours} className="flex-row justify-between items-center">
                            <Text className="text-base font-bold text-slate-900">Giờ hoạt động</Text>
                            <Text className="text-primary-strong text-xs font-bold">{showAllHours ? 'THU GỌN' : 'XEM TẤT CẢ'}</Text>
                        </Button>

                        {!showAllHours ? (
                            <Text className="text-slate-600 text-sm mt-2">
                                Hôm nay:{' '}
                                {place.openingHours?.weekday_text
                                    ? place.openingHours.weekday_text[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.split(': ')[1]
                                    : 'Mở cả ngày'}
                            </Text>
                        ) : (
                            <View className="mt-3">
                                {place.openingHours?.weekday_text
                                    ? place.openingHours.weekday_text.map((day, index) => (
                                        <View key={index} className="flex-row justify-between py-1.5 border-b border-slate-200/50">
                                            <Text className="text-slate-600 text-sm capitalize">{day.split(': ')[0]}</Text>
                                            <Text className="text-slate-900 text-sm font-medium">{day.split(': ')[1]}</Text>
                                        </View>
                                    ))
                                    : ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((day, index) => (
                                        <View key={index} className="flex-row justify-between py-1.5 border-b border-slate-200/50">
                                            <Text className="text-slate-600 text-sm">{day}</Text>
                                            <Text className="text-slate-900 text-sm font-medium">00:00 - 24:00</Text>
                                        </View>
                                    ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View
                className="absolute left-4 right-4 bg-white rounded-3xl border border-slate-200 px-4 py-3 flex-row items-center gap-x-3 shadow-xl"
                style={{ bottom: Math.max(insets.bottom, 12) }}
            >
                <View className="flex-1 pr-2">
                    <Text className="text-slate-400 text-[9px] font-bold uppercase">Dự kiến</Text>
                    <Text className="text-lg font-black text-slate-900">
                        {getEstimatedPrice()}
                        <Text className="text-xs font-normal text-slate-400"> /ng</Text>
                    </Text>
                </View>

                <Button
                    label="Review"
                    onPress={onReview || (() => { })}
                    disabled={!onReview}
                    variant="secondary"
                    rightSlot={<View style={{ marginLeft: 8 }}><StarIcon /></View>}
                    style={{ flex: 1, width: 'auto', minHeight: 56, borderRadius: 16, borderColor: '#E2E8F0', backgroundColor: '#F1F5F9' }}
                    textColor="#475569"
                />

                <Button
                    label="Bản đồ"
                    onPress={handleOpenMap}
                    rightSlot={(
                        <View style={{ marginLeft: 8 }}>
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <Path d="M5 12h14M12 5l7 7-7 7" />
                            </Svg>
                        </View>
                    )}
                    style={{ flex: 1.2, width: 'auto', minHeight: 56, borderRadius: 16, backgroundColor: '#2563EB' }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        position: 'absolute',
        top: -60,
        left: 20,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 15,
    },
});
