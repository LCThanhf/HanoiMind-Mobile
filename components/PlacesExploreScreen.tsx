import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, SafeAreaView,
    TextInput, Image, ActivityIndicator, Alert, RefreshControl, StyleSheet
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Location from 'expo-location';
import { BottomTabBar } from './BottomTabBar';

// Import Service và Types
import { PlacesService } from '../services/placeService/place.service';
import { Place, PlaceCategory } from '../services/placeService/place.type';

// 1. Bản dịch tiếng Việt cho các Category (Khớp với PlaceCategory Enum)
const CategoryVi: Record<string, string> = {
    'Tất cả': 'Tất cả',
    [PlaceCategory.ACCOMMODATION]: 'Lưu trú',
    [PlaceCategory.HOTEL]: 'Khách sạn',
    [PlaceCategory.HOSTEL]: 'Hostel',
    [PlaceCategory.HOMESTAY]: 'Homestay',
    [PlaceCategory.RESORT]: 'Resort',
    [PlaceCategory.GUEST_HOUSE]: 'Nhà nghỉ',
    [PlaceCategory.RESTAURANT]: 'Nhà hàng',
    [PlaceCategory.CAFE]: 'Cà phê',
    [PlaceCategory.BAR_PUB]: 'Bar & Pub',
    [PlaceCategory.STREET_FOOD]: 'Ẩm thực vỉa hè',
    [PlaceCategory.SIGHTSEEING]: 'Tham quan',
    [PlaceCategory.CULTURE]: 'Văn hóa',
    [PlaceCategory.PARK]: 'Công viên',
    [PlaceCategory.EXPERIENCE]: 'Trải nghiệm',
    [PlaceCategory.ENTERTAINMENT]: 'Giải trí',
    [PlaceCategory.WELLNESS]: 'Sức khỏe & Spa',
    [PlaceCategory.SHOPPING]: 'Mua sắm',
    [PlaceCategory.LOCAL_MARKET]: 'Chợ địa phương',
    [PlaceCategory.TRANSPORT]: 'Giao thông',
    [PlaceCategory.HEALTH]: 'Y tế',
    [PlaceCategory.FINANCE]: 'Tài chính',
    [PlaceCategory.CONVENIENCE]: 'Cửa hàng tiện lợi',
    [PlaceCategory.LAUNDRY]: 'Giặt là',
    [PlaceCategory.OTHER]: 'Khác'
};

const CATEGORY_LIST = ['Tất cả', ...Object.values(PlaceCategory)];

const SORT_OPTIONS = [
    { label: 'Gần nhất', value: 'distance' },
    { label: 'Đánh giá', value: 'rating' },
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Độ đông đúc', value: 'crowdLevel' },
];

const CROWD_FILTERS = [
    { label: 'Tất cả ', value: undefined },
    { label: 'Rất vắng (1)', value: 1 },
    { label: 'Thoải mái (≤2)', value: 2 },
    { label: 'Trung bình (≤3)', value: 3 },
    { label: 'Đông đúc (≤4)', value: 4 },
    { label: 'Cực đông (5)', value: 5 },
];

export const PlacesExploreScreen = ({ onBack, activeTab, onTabChange }: any) => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'createdAt' | 'crowdLevel'>('distance');
    const [maxCrowd, setMaxCrowd] = useState<number | undefined>(undefined);
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setPage(1);
        fetchData(1, false);
    }, [activeCategory, sortBy, maxCrowd]);

    const fetchData = async (targetPage: number, isLoadMore: boolean) => {
        try {
            isLoadMore ? setLoadingMore(true) : setLoading(true);

            let { status } = await Location.requestForegroundPermissionsAsync();
            let coords = { latitude: 21.0285, longitude: 105.8542 }; 
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                coords = location.coords;
            }

            const response = await PlacesService.findAll({
                name: searchText || undefined,
                category: activeCategory === 'Tất cả' ? undefined : (activeCategory as PlaceCategory),
                lat: coords.latitude,
                lng: coords.longitude,
                radius: 10000, 
                page: targetPage,
                limit: 10,
                sortBy: sortBy,
                sortOrder: sortBy === 'rating' ? 'DESC' : 'ASC',
                maxCrowd: maxCrowd 
            });

            setPlaces(isLoadMore ? [...places, ...response.data] : response.data);
            setHasMore(response.data.length === 10);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải danh sách địa điểm");
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        fetchData(1, false);
    }, [activeCategory, searchText, sortBy, maxCrowd]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}><Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M19 12H5M12 19l-7-7 7-7" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg></TouchableOpacity>
                <Text style={styles.headerTitle}>Khám phá địa điểm</Text>
            </View>

            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <View style={styles.searchContainer}>
                    <TextInput value={searchText} onChangeText={setSearchText} onSubmitEditing={() => {setPage(1); fetchData(1, false);}} placeholder="Tìm địa điểm..." style={{ flex: 1, fontSize: 14 }} />
                </View>
            </View>

            {/* Dòng 1: Sort Options + Categories (Tiếng Việt) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow} style={{ flexGrow: 0 }}>
                <View style={styles.sortGroup}>
                    {SORT_OPTIONS.map((opt) => (
                        <TouchableOpacity key={opt.value} onPress={() => setSortBy(opt.value as any)} style={[styles.pill, sortBy === opt.value && styles.pillSortActive]}>
                            <Text style={[styles.pillText, sortBy === opt.value && styles.pillTextActive]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.divider} />
                {CATEGORY_LIST.map((cat) => (
                    <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)} style={[styles.pill, activeCategory === cat && styles.pillCatActive]}>
                        <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                            {CategoryVi[cat] || cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Dòng 2: Filter Options (Crowd Level) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow} style={{ flexGrow: 0, marginTop: 8, marginBottom: 10 }}>
                <Text style={styles.filterLabel}>Lọc:</Text>
                {CROWD_FILTERS.map((f) => (
                    <TouchableOpacity key={String(f.value)} onPress={() => setMaxCrowd(f.value)} style={[styles.filterPill, maxCrowd === f.value && styles.filterPillActive]}>
                        <Text style={[styles.filterPillText, maxCrowd === f.value && styles.pillTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2B8EF0" style={{ marginTop: 20 }} />
                ) : (
                    <>
                        {places.map((place) => (
                            <TouchableOpacity key={place._id} style={styles.placeCard}>
                                <Image source={{ uri: place.images[0] || 'https://via.placeholder.com/150' }} style={styles.placeImage} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.placeName}>{place.name}</Text>
                                    <Text style={styles.infoText}>{place.distance ? `${(place.distance / 1000).toFixed(1)} km` : 'N/A'} • {place.reviewCount} đánh giá</Text>
                                    <View style={styles.crowdBadge}>
                                        <Text style={styles.crowdText}>Độ đông đúc: {place.crowdLevel}/5</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {hasMore && (
                            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => { const p = page + 1; setPage(p); fetchData(p, true); }}>
                                {loadingMore ? <ActivityIndicator size="small" color="#2B8EF0" /> : <Text style={styles.loadMoreText}>Xem thêm địa điểm</Text>}
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ScrollView>
            <BottomTabBar activeTab={activeTab} onTabPress={onTabChange} />
        </SafeAreaView>
    );
};

// ... Styles giữ nguyên như các bước trước
const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, backgroundColor: 'white', height: 46, borderWidth: 1, borderColor: '#E5E7EB' },
    scrollRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    sortGroup: { flexDirection: 'row', gap: 6 },
    divider: { width: 1, height: 20, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
    pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
    pillSortActive: { backgroundColor: '#FBBF24', borderColor: '#FBBF24' },
    pillCatActive: { backgroundColor: '#2B8EF0', borderColor: '#2B8EF0' },
    pillText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    pillTextActive: { color: 'white', fontWeight: '700' },
    filterLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginRight: 4 },
    filterPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3F4F6' },
    filterPillActive: { backgroundColor: '#10B981' },
    filterPillText: { fontSize: 11, color: '#4B5563' },
    placeCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 12, gap: 12 },
    placeImage: { width: 100, height: 80, borderRadius: 10 },
    placeName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    infoText: { fontSize: 12, color: '#6B7280' },
    crowdBadge: { marginTop: 6, backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    crowdText: { fontSize: 10, color: '#D97706', fontWeight: '700' },
    loadMoreBtn: { padding: 15, alignItems: 'center' },
    loadMoreText: { color: '#2B8EF0', fontWeight: '700' }
});