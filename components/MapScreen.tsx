import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    View, Text, ActivityIndicator, Alert,
    Platform, Linking, LayoutAnimation, StyleSheet, ScrollView,
    Animated, PanResponder, Dimensions
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import {
    ArrowLeft, Navigation, ExternalLink, MapPin, X,
    Car, Clock, Map as MapIcon, MoreVertical, Bike, Footprints,
    ArrowUp, ArrowDown, ArrowUpLeft, ArrowUpRight, ArrowLeft as LeftIcon, ArrowRight as RightIcon,
    CornerUpLeft, CornerUpRight, CircleDot
} from 'lucide-react-native';
import { Button, ScreenHeader } from './shared';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- CẤU HÌNH CÁC MỐC SNAP (TÍNH THEO CHIỀU CAO MÀN HÌNH) ---
// Mốc 0: 15% (Thu gọn nhất)
// Mốc 1: 50% (Mở vừa phải)
// Mốc 2: 85% (Mở full màn hình)
const SNAP_POINTS = [
    SCREEN_HEIGHT * 0.15,
    SCREEN_HEIGHT * 0.50,
    SCREEN_HEIGHT * 0.65
];

// Tọa độ Y tương ứng để đẩy Animated.View lên
const TRANSLATE_Y_SNAPS = [
    0,                                      // Ở mốc 15% (Base)
    -(SNAP_POINTS[1] - SNAP_POINTS[0]),     // Đẩy lên mốc 50%
    -(SNAP_POINTS[2] - SNAP_POINTS[0])      // Đẩy lên mốc 85%
];

// Cấu hình ORS
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVlMjMxNjJjNGViMTQyZjc4ZjlmMzk5YzRkNTIxM2FmIiwiaCI6Im11cm11cjY0In0=';

const getStepIcon = (instruction: string = '', modifier: string = '', type: number) => {
    const text = instruction.toLowerCase();
    if (type === 10 || text.includes('arrive') || text.includes('destination')) return MapPin;
    if (type === 0 || text.includes('start')) return Navigation;
    if (text.includes('u-turn') || text.includes('uturn') || text.includes('roundabout')) return CircleDot;
    if (text.includes('sharp left')) return CornerUpLeft;
    if (text.includes('sharp right')) return CornerUpRight;
    if (text.includes('slight left') || text.includes('keep left')) return ArrowUpLeft;
    if (text.includes('slight right') || text.includes('keep right')) return ArrowUpRight;
    if (text.includes('left') || text.includes('west')) return LeftIcon;
    if (text.includes('right') || text.includes('east')) return RightIcon;
    if (text.includes('down') || text.includes('south')) return ArrowDown;
    if (text.includes('straight') || text.includes('continue') || text.includes('ahead') || text.includes('north') || text.includes('up')) return ArrowUp;

    switch (modifier) {
        case 'left': return LeftIcon;
        case 'right': return RightIcon;
        case 'sharp left': return CornerUpLeft;
        case 'sharp right': return CornerUpRight;
        case 'slight left': return ArrowUpLeft;
        case 'slight right': return ArrowUpRight;
        case 'uturn': return CircleDot;
        case 'straight': return ArrowUp;
    }
    return ArrowUp;
};

export const MapScreen = ({ place, onBack }: { place: any, onBack: () => void }) => {
    const mapRef = useRef<MapView>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    const [travelMode, setTravelMode] = useState<'driving-car' | 'foot-walking' | 'cycling-regular'>('driving-car');
    const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [isLocating, setIsLocating] = useState(true);
    const [routeState, setRouteState] = useState<'IDLE' | 'LOADING' | 'READY' | 'NAVIGATING'>('IDLE');
    const [routeData, setRouteData] = useState<any>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // --- LOGIC ANIMATION ĐA ĐIỂM DỪNG (MULTI-SNAP) ---
    const pan = useRef(new Animated.Value(0)).current;
    const currentPanValue = useRef(0);

    // Lắng nghe và lưu lại vị trí Y hiện tại liên tục
    useEffect(() => {
        const listener = pan.addListener((val) => { currentPanValue.current = val.value; });
        return () => pan.removeListener(listener);
    }, [pan]);

    const panResponder = useRef(
        PanResponder.create({
            // Chỉ chiếm quyền điều khiển khi vuốt dọc mạnh hơn 10px (để không chặn click bên trong)
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
            onPanResponderGrant: () => {
                // Khóa offset tại vị trí hiện tại trước khi kéo tiếp
                pan.setOffset(currentPanValue.current);
                pan.setValue(0);
            },
            onPanResponderMove: Animated.event([null, { dy: pan }], { useNativeDriver: false }),
            onPanResponderRelease: (_, gestureState) => {
                pan.flattenOffset(); // Gộp offset và value lại

                // Tính vị trí dự kiến thả ra (cộng thêm vận tốc vy để tạo lực quán tính quẹt ngón tay)
                const projectedY = currentPanValue.current + gestureState.vy * 100;

                // Tìm Mốc Snap gần với vị trí thả tay ra nhất
                const nearestSnap = TRANSLATE_Y_SNAPS.reduce((prev, curr) => {
                    return (Math.abs(curr - projectedY) < Math.abs(prev - projectedY) ? curr : prev);
                });

                // Chạy animation khít vào mốc vừa tìm được
                Animated.spring(pan, {
                    toValue: nearestSnap,
                    useNativeDriver: false,
                    friction: 8,
                    tension: 40
                }).start();
            },
        })
    ).current;

    const destLocation = useMemo(() => {
        const coords = place?.location?.coordinates || [0, 0];
        return { latitude: parseFloat(coords[1].toString()), longitude: parseFloat(coords[0].toString()) };
    }, [place]);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setUserLocation(loc.coords);
                if (destLocation.latitude !== 0) {
                    mapRef.current?.animateToRegion({ ...destLocation, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
                }
            } finally { setIsLocating(false); }
        })();
        return () => locationSubscription.current?.remove();
    }, [destLocation]);

    const fetchRoute = async (mode = travelMode) => {
        if (!userLocation) return;
        setRouteState('LOADING');
        setRouteData(null);
        try {
            const url = `${ORS_BASE_URL}/${mode}?api_key=${ORS_API_KEY}&start=${userLocation.longitude},${userLocation.latitude}&end=${destLocation.longitude},${destLocation.latitude}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.features?.length > 0) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                const route = data.features[0];
                const normalized = {
                    distance: route.properties.summary.distance,
                    duration: route.properties.summary.duration,
                    steps: route.properties.segments[0].steps,
                    coordinates: route.geometry.coordinates.map((c: any) => ({ latitude: c[1], longitude: c[0] }))
                };
                setRouteData(normalized);
                setRouteState('READY');

                // Tự động bật lên mốc 50% khi load đường xong
                Animated.spring(pan, { toValue: TRANSLATE_Y_SNAPS[1], useNativeDriver: false, friction: 8 }).start();

                mapRef.current?.fitToCoordinates(normalized.coordinates, {
                    edgePadding: { top: 80, right: 80, bottom: SNAP_POINTS[1] + 40, left: 80 }, animated: true,
                });
            }
        } catch (e) { setRouteState('IDLE'); Alert.alert("Lỗi", "Không thể lấy lộ trình."); }
    };

    const startNavigation = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setRouteState('NAVIGATING');

        // Thu gọn bảng về 15% khi bắt đầu chạy xe
        Animated.spring(pan, { toValue: TRANSLATE_Y_SNAPS[0], useNativeDriver: false, friction: 8 }).start();

        locationSubscription.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 5 },
            (newLoc) => {
                setUserLocation(newLoc.coords);
                mapRef.current?.animateCamera({ center: { latitude: newLoc.coords.latitude, longitude: newLoc.coords.longitude }, pitch: 60, heading: newLoc.coords.heading || 0, zoom: 19 });
            }
        );
    };

    const steps = useMemo(() => routeData?.steps || [], [routeData]);

    if (isLocating) return <ActivityIndicator style={{ flex: 1 }} color="#3B82F6" />;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScreenHeader
                title={place?.name || 'Chỉ dẫn địa điểm'}
                onBack={onBack}
                horizontalPadding={16}
                topPadding={8}
                bottomPadding={12}
                titleSize={17}
                titleWeight="700"
                containerStyle={{ zIndex: 10 }}
                rightSlot={<Button style={styles.headerBtn}><MoreVertical color="#111827" size={24} /></Button>}
            />

            <View style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

                {routeState === 'NAVIGATING' && steps[currentStepIndex] && (
                    <View style={[styles.navHeader, { paddingTop: 10 }]}>
                        <View style={styles.navHeaderContent}>
                            {(() => {
                                const Icon = getStepIcon(steps[currentStepIndex].instruction, steps[currentStepIndex].modifier, steps[currentStepIndex].type);
                                return (
                                    <>
                                        <Icon color="#fff" size={32} />
                                        <View style={{ marginLeft: 15, flex: 1 }}>
                                            <Text style={styles.navInstruction} numberOfLines={2}>{steps[currentStepIndex].instruction}</Text>
                                            <Text style={styles.navSubText}>Còn {Math.round(steps[currentStepIndex].distance)}m</Text>
                                        </View>
                                    </>
                                );
                            })()}
                            <Button onPress={() => { locationSubscription.current?.remove(); setRouteState('READY'); }}><X color="#fff" size={24} /></Button>
                        </View>
                    </View>
                )}

                <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={{ ...destLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                    {routeData?.coordinates && <Polyline coordinates={routeData.coordinates} strokeColor="#3B82F6" strokeWidth={6} />}
                    <Marker coordinate={destLocation} title={place?.name} />
                    {userLocation && (
                        <Marker coordinate={userLocation} flat anchor={{ x: 0.5, y: 0.5 }} rotation={userLocation.heading || 0}>
                            <View style={styles.userMarker}><Navigation size={22} color="#3B82F6" fill="#3B82F6" /></View>
                        </Marker>
                    )}
                </MapView>

                {/* BẢNG VUỐT MULTI-SNAP */}
                <Animated.View style={[styles.bottomPanel, { transform: [{ translateY: pan }] }]} {...panResponder.panHandlers}>
                    <View style={styles.dragHandleWrapper}>
                        <View style={styles.dragHandle} />
                    </View>

                    <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                        {routeState === 'IDLE' || routeState === 'LOADING' ? (
                            <View style={styles.idleContent}>
                                <View style={{ flex: 1 }}><Text style={styles.placeName}>{place?.name || "Địa điểm"}</Text><Text style={styles.placeSub}>Bắt đầu tìm đường đi</Text></View>
                                <Button onPress={() => fetchRoute()} style={styles.mainNavBtn}>{routeState === 'LOADING' ? <ActivityIndicator color="#fff" /> : <Navigation color="#fff" size={28} />}</Button>
                            </View>
                        ) : (
                            <View style={{ paddingHorizontal: 20 }}>
                                <View style={styles.modeSelector}>
                                    <ModeTab active={travelMode === 'driving-car'} icon={<Car size={18} />} label="Ô tô" onPress={() => { setTravelMode('driving-car'); fetchRoute('driving-car'); }} />
                                    <ModeTab active={travelMode === 'cycling-regular'} icon={<Bike size={18} />} label="Xe đạp" onPress={() => { setTravelMode('cycling-regular'); fetchRoute('cycling-regular'); }} />
                                    <ModeTab active={travelMode === 'foot-walking'} icon={<Footprints size={18} />} label="Đi bộ" onPress={() => { setTravelMode('foot-walking'); fetchRoute('foot-walking'); }} />
                                </View>

                                <View style={styles.statsCard}>
                                    <StatItem icon={<MapIcon size={18} color="#3B82F6" />} label="QUÃNG ĐƯỜNG" value={`${(routeData.distance / 1000).toFixed(1)} km`} />
                                    <StatItem icon={<Clock size={18} color="#EF4444" />} label="THỜI GIAN" value={`${Math.round(routeData.duration / 60)} phút`} border />
                                    <StatItem icon={<Car size={18} color="#22C55E" />} label="PHƯƠNG TIỆN" value={travelMode === 'driving-car' ? "Xe hơi" : travelMode === 'cycling-regular' ? "Xe đạp" : "Đi bộ"} />
                                </View>

                                <View style={styles.stepSection}>
                                    <Text style={styles.sectionTitle}>Các bước di chuyển</Text>
                                    {steps.map((step: any, index: number) => {
                                        const Icon = getStepIcon(step.instruction, step.modifier, step.type);
                                        return (
                                            <View key={index} style={styles.stepRow}>
                                                <View style={styles.stepIndicator}>
                                                    <View style={[styles.stepIconCircle, index === currentStepIndex && styles.activeIconCircle]}>
                                                        <Icon size={16} color={index === currentStepIndex ? "#fff" : "#94A3B8"} />
                                                    </View>
                                                    {index !== steps.length - 1 && <View style={styles.stepLine} />}
                                                </View>
                                                <View style={styles.stepContent}>
                                                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                                                    <Text style={styles.stepMeta}>{Math.round(step.distance)}m • Khoảng {Math.round(step.duration / 60)} phút</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </Animated.View>
            </View>

            {(routeState === 'READY' || routeState === 'NAVIGATING') && (
                <View style={styles.fixedActionBar}>
                    <Button style={routeState === 'NAVIGATING' ? styles.stopBtn : styles.startBtn} onPress={routeState === 'NAVIGATING' ? () => { locationSubscription.current?.remove(); setRouteState('READY'); } : startNavigation}>
                        <Navigation color="#fff" size={20} style={{ transform: [{ rotate: '45deg' }], marginRight: 10 }} />
                        <Text style={styles.btnText}>{routeState === 'NAVIGATING' ? "DỪNG DẪN ĐƯỜNG" : "BẮT ĐẦU CHỈ ĐƯỜNG"}</Text>
                    </Button>
                    <Button style={styles.googleBtn} onPress={() => Linking.openURL(`google.navigation:q=${destLocation.latitude},${destLocation.longitude}`)}>
                        <ExternalLink color="#111827" size={18} style={{ marginRight: 8 }} />
                        <Text style={styles.googleBtnText}>MỞ TRONG GOOGLE MAPS</Text>
                    </Button>
                </View>
            )}
        </View>
    );
};

const StatItem = ({ icon, label, value, border }: any) => (
    <View style={[styles.statItem, border && { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' }]}>
        <View style={styles.statIconCircle}>{icon}</View>
        <Text style={styles.statLabelText}>{label}</Text>
        <Text style={styles.statValueText}>{value}</Text>
    </View>
);

const ModeTab = ({ active, icon, label, onPress }: any) => (
    <Button onPress={onPress} style={[styles.modeTab, active && styles.modeTabActive]}>
        {React.cloneElement(icon, { color: active ? '#3B82F6' : '#94A3B8' })}
        <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{label}</Text>
    </Button>
);

const styles = StyleSheet.create({
    headerBtn: { padding: 4 },
    userMarker: { backgroundColor: '#fff', padding: 6, borderRadius: 20, elevation: 5 },
    navHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#3B82F6', zIndex: 10, paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    navHeaderContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
    navInstruction: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    navSubText: { color: '#DBEAFE', fontSize: 13, marginTop: 2 },

    // Panel Style cho Multi-Snap
    bottomPanel: {
        position: 'absolute',
        bottom: -(SNAP_POINTS[2] - SNAP_POINTS[0]), // Giấu phần lớn panel ở dưới
        height: SNAP_POINTS[2], // Tổng chiều cao bằng với Mốc 85%
        left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 35, borderTopRightRadius: 35,
        elevation: 25, shadowOpacity: 0.15
    },
    dragHandleWrapper: { alignItems: 'center', paddingVertical: 15 },
    dragHandle: { width: 50, height: 6, backgroundColor: '#CBD5E1', borderRadius: 3 },

    idleContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 30 },
    placeName: { fontSize: 22, fontWeight: '800', color: '#111827' },
    placeSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    mainNavBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
    modeSelector: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 4, marginBottom: 20 },
    modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
    modeTabActive: { backgroundColor: '#fff', elevation: 3, shadowOpacity: 0.1, shadowRadius: 4 },
    modeLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
    modeLabelActive: { color: '#111827' },
    statsCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, paddingVertical: 18, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, marginBottom: 20 },
    statItem: { flex: 1, alignItems: 'center' },
    statIconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    statLabelText: { fontSize: 8, fontWeight: 'bold', color: '#94A3B8' },
    statValueText: { fontSize: 14, fontWeight: '800', color: '#111827' },
    stepSection: { paddingBottom: 20 },
    sectionTitle: { fontSize: 19, fontWeight: '800', color: '#111827', marginBottom: 15 },
    stepRow: { flexDirection: 'row', minHeight: 70 },
    stepIndicator: { width: 40, alignItems: 'center' },
    stepIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    activeIconCircle: { backgroundColor: '#3B82F6' },
    stepLine: { width: 2, position: 'absolute', top: 32, bottom: -10, backgroundColor: '#F1F5F9', zIndex: 1 },
    stepContent: { flex: 1, paddingLeft: 12 },
    stepInstruction: { fontSize: 15, fontWeight: '600', color: '#111827', lineHeight: 22 },
    stepMeta: { fontSize: 13, color: '#6B7280', marginTop: 3 },

    fixedActionBar: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10, gap: 10, zIndex: 50 },
    startBtn: { backgroundColor: '#3B82F6', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    stopBtn: { backgroundColor: '#EF4444', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    googleBtn: { height: 58, borderRadius: 18, borderWidth: 1.5, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    googleBtnText: { color: '#111827', fontWeight: 'bold', fontSize: 15 },
});
