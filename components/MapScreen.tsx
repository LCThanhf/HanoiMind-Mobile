import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
    View, Text, TouchableOpacity, ActivityIndicator, Alert, 
    Platform, Linking, LayoutAnimation, StyleSheet, ScrollView,
    Animated, PanResponder, Dimensions 
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { 
    ArrowLeft, Navigation, ExternalLink, MapPin, X, 
    Car, Clock, Map as MapIcon, ChevronUp, ChevronDown, MoreVertical, Bike, Footprints,
    ArrowUp, ArrowUpLeft, ArrowUpRight, ArrowLeft as LeftIcon, ArrowRight as RightIcon, 
    CornerUpLeft, CornerUpRight, CircleDot
} from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_MIN_HEIGHT = 160; 
const PANEL_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;

// Cấu hình ORS
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVlMjMxNjJjNGViMTQyZjc4ZjlmMzk5YzRkNTIxM2FmIiwiaCI6Im11cm11cjY0In0='; 

// --- UTILS: Dịch thuật và Mapping Icon ---
const getStepAssets = (modifier: string, type: number) => {
    let Icon = ArrowUp;
    let text = "Đi thẳng";

    switch (modifier) {
        case 'left': Icon = LeftIcon; text = "Rẽ trái"; break;
        case 'right': Icon = RightIcon; text = "Rẽ phải"; break;
        case 'sharp left': Icon = CornerUpLeft; text = "Rẽ ngoặt bên trái"; break;
        case 'sharp right': Icon = CornerUpRight; text = "Rẽ ngoặt bên phải"; break;
        case 'slight left': Icon = ArrowUpLeft; text = "Chếch sang trái"; break;
        case 'slight right': Icon = ArrowUpRight; text = "Chếch sang phải"; break;
        case 'uturn': Icon = CircleDot; text = "Quay đầu xe"; break;
        case 'straight': Icon = ArrowUp; text = "Đi thẳng"; break;
    }

    if (type === 10) { Icon = MapPin; text = "Đến nơi"; }
    else if (type === 0) { Icon = Navigation; text = ""; }

    return { Icon, text };
};

export const MapScreen = ({ place, onBack }: { place: any, onBack: () => void }) => {
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    // --- State điều khiển ---
    const [travelMode, setTravelMode] = useState<'driving-car' | 'foot-walking' | 'cycling-regular'>('driving-car');
    const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [isLocating, setIsLocating] = useState(true);
    const [routeState, setRouteState] = useState<'IDLE' | 'LOADING' | 'READY' | 'NAVIGATING'>('IDLE');
    const [routeData, setRouteData] = useState<any>(null); 
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // --- Animation & PanResponder cho Bottom Panel ---
    const pan = useRef(new Animated.Value(0)).current;
    const [isExpanded, setIsExpanded] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy < 0 && !isExpanded) pan.setValue(gestureState.dy);
                if (gestureState.dy > 0 && isExpanded) pan.setValue(-(PANEL_MAX_HEIGHT - PANEL_MIN_HEIGHT) + gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy < -50) togglePanel(true);
                else if (gestureState.dy > 50) togglePanel(false);
                else togglePanel(isExpanded);
            },
        })
    ).current;

    const togglePanel = (expand: boolean) => {
        setIsExpanded(expand);
        Animated.spring(pan, { toValue: expand ? -(PANEL_MAX_HEIGHT - PANEL_MIN_HEIGHT) : 0, useNativeDriver: false, friction: 8 }).start();
    };

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
                mapRef.current?.fitToCoordinates(normalized.coordinates, {
                    edgePadding: { top: 80, right: 80, bottom: PANEL_MIN_HEIGHT + 40, left: 80 }, animated: true,
                });
            }
        } catch (e) { setRouteState('IDLE'); Alert.alert("Lỗi", "Không thể lấy lộ trình."); }
    };

    const startNavigation = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setRouteState('NAVIGATING');
        togglePanel(false);
        locationSubscription.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 5 },
            (newLoc) => {
                setUserLocation(newLoc.coords);
                mapRef.current?.animateCamera({ center: { latitude: newLoc.coords.latitude, longitude: newLoc.coords.longitude }, pitch: 60, heading: newLoc.coords.heading || 0, zoom: 19 });
            }
        );
    };

    const steps = useMemo(() => routeData?.steps || [], [routeData]);

    if (isLocating) return <ActivityIndicator style={{flex: 1}} color="#3B82F6" />;

    return (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
            {/* Header Chính */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={onBack} style={styles.headerBtn}><ArrowLeft color="#1E293B" size={24} /></TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{place?.name || "Chỉ dẫn địa điểm"}</Text>
                <TouchableOpacity style={styles.headerBtn}><MoreVertical color="#1E293B" size={24} /></TouchableOpacity>
            </View>

            {/* Nav Header (Khi đang lái xe) */}
            {routeState === 'NAVIGATING' && steps[currentStepIndex] && (
                <View style={[styles.navHeader, { paddingTop: insets.top + 10 }]}>
                    <View style={styles.navHeaderContent}>
                        {(() => {
                            const { Icon, text } = getStepAssets(steps[currentStepIndex].modifier, steps[currentStepIndex].type);
                            return (
                                <>
                                    <Icon color="#fff" size={32} />
                                    <View style={{ marginLeft: 15, flex: 1 }}>
                                        <Text style={styles.navInstruction}>{text} vào {steps[currentStepIndex].name && steps[currentStepIndex].name !== "-" ? steps[currentStepIndex].name : "đường hiện tại"}</Text>
                                        <Text style={styles.navSubText}>Còn {Math.round(steps[currentStepIndex].distance)}m</Text>
                                    </View>
                                </>
                            );
                        })()}
                        <TouchableOpacity onPress={() => { locationSubscription.current?.remove(); setRouteState('READY'); }}><X color="#fff" size={24} /></TouchableOpacity>
                    </View>
                </View>
            )}

            <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={{flex: 1}} initialRegion={{ ...destLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                {routeData?.coordinates && <Polyline coordinates={routeData.coordinates} strokeColor="#3B82F6" strokeWidth={6} />}
                <Marker coordinate={destLocation} title={place?.name} />
                {userLocation && (
                    <Marker coordinate={userLocation} flat anchor={{x: 0.5, y: 0.5}} rotation={userLocation.heading || 0}>
                        <View style={styles.userMarker}><Navigation size={22} color="#3B82F6" fill="#3B82F6" /></View>
                    </Marker>
                )}
            </MapView>

            {/* Bottom Panel */}
            <Animated.View style={[styles.bottomPanel, { height: PANEL_MAX_HEIGHT, transform: [{ translateY: pan }] }]} {...panResponder.panHandlers}>
                <TouchableOpacity activeOpacity={1} onPress={() => togglePanel(!isExpanded)} style={styles.dragHandleWrapper}>
                    <View style={styles.dragHandle} /><Text style={styles.dragTitle}>{isExpanded ? 'Vuốt xuống để thu gọn' : 'Chi tiết lộ trình'}</Text>
                </TouchableOpacity>

                <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
                    {routeState === 'IDLE' || routeState === 'LOADING' ? (
                        <View style={styles.idleContent}>
                            <View style={{ flex: 1 }}><Text style={styles.placeName}>{place?.name || "Địa điểm"}</Text><Text style={styles.placeSub}>Chọn phương tiện để bắt đầu</Text></View>
                            <TouchableOpacity onPress={() => fetchRoute()} style={styles.mainNavBtn}>{routeState === 'LOADING' ? <ActivityIndicator color="#fff" /> : <Navigation color="#fff" size={28} />}</TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ paddingHorizontal: 20 }}>
                            {/* Chuyển đổi phương tiện */}
                            <View style={styles.modeSelector}>
                                <ModeTab active={travelMode === 'driving-car'} icon={<Car size={18}/>} label="Ô tô" onPress={() => {setTravelMode('driving-car'); fetchRoute('driving-car');}} />
                                <ModeTab active={travelMode === 'cycling-regular'} icon={<Bike size={18}/>} label="Xe đạp" onPress={() => {setTravelMode('cycling-regular'); fetchRoute('cycling-regular');}} />
                                <ModeTab active={travelMode === 'foot-walking'} icon={<Footprints size={18}/>} label="Đi bộ" onPress={() => {setTravelMode('foot-walking'); fetchRoute('foot-walking');}} />
                            </View>

                            <View style={styles.statsCard}>
                                <StatItem icon={<MapIcon size={18} color="#3B82F6" />} label="TỔNG QUÃNG ĐƯỜNG" value={`${(routeData.distance / 1000).toFixed(1)} km`} />
                                <StatItem icon={<Clock size={18} color="#EF4444" />} label="THỜI GIAN DỰ KIẾN" value={`${Math.round(routeData.duration / 60)} phút`} border />
                                <StatItem icon={<Car size={18} color="#22C55E" />} label="PHƯƠNG TIỆN" value={travelMode === 'driving-car' ? "Xe hơi" : travelMode === 'cycling-regular' ? "Xe đạp" : "Đi bộ"} />
                            </View>

                            <View style={styles.stepSection}>
                                <Text style={styles.sectionTitle}>Các bước di chuyển</Text>
                                {steps.map((step: any, index: number) => {
                                    const { Icon, text } = getStepAssets(step.modifier, step.type);
                                    return (
                                        <View key={index} style={styles.stepRow}>
                                            <View style={styles.stepIndicator}>
                                                <View style={[styles.stepIconCircle, index === currentStepIndex && styles.activeIconCircle]}>
                                                    <Icon size={16} color={index === currentStepIndex ? "#fff" : "#94A3B8"} />
                                                </View>
                                                {index !== steps.length - 1 && <View style={styles.stepLine} />}
                                            </View>
                                            <View style={styles.stepContent}>
                                                <Text style={styles.stepInstruction}>{text} {step.name && step.name !== '-' ? `vào ${step.name}` : ""}</Text>
                                                <Text style={styles.stepMeta}>{Math.round(step.distance)}m • Khoảng {Math.round(step.duration / 60)} phút</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Sticky Action Area */}
                {(routeState === 'READY' || routeState === 'NAVIGATING') && (
                    <View style={styles.stickyActionArea}>
                        <TouchableOpacity style={routeState === 'NAVIGATING' ? styles.stopBtn : styles.startBtn} onPress={routeState === 'NAVIGATING' ? () => { locationSubscription.current?.remove(); setRouteState('READY'); } : startNavigation}>
                            <Navigation color="#fff" size={20} style={{ transform: [{ rotate: '45deg' }], marginRight: 10 }} />
                            <Text style={styles.btnText}>{routeState === 'NAVIGATING' ? "DỪNG DẪN ĐƯỜNG" : "BẮT ĐẦU CHỈ ĐƯỜNG"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.googleBtn} onPress={() => Linking.openURL(`google.navigation:q=${destLocation.latitude},${destLocation.longitude}`)}>
                            <ExternalLink color="#1E293B" size={18} style={{ marginRight: 8 }} /><Text style={styles.googleBtnText}>MỞ TRONG GOOGLE MAPS</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
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
    <TouchableOpacity onPress={onPress} style={[styles.modeTab, active && styles.modeTabActive]}>
        {React.cloneElement(icon, { color: active ? '#3B82F6' : '#94A3B8' })}
        <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F1F5F9' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', flex: 1, textAlign: 'center' },
    headerBtn: { padding: 4 },
    userMarker: { backgroundColor: '#fff', padding: 6, borderRadius: 20, elevation: 5 },
    navHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#3B82F6', zIndex: 10, paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    navHeaderContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
    navInstruction: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    navSubText: { color: '#DBEAFE', fontSize: 13, marginTop: 2 },
    bottomPanel: { position: 'absolute', bottom: -(PANEL_MAX_HEIGHT - PANEL_MIN_HEIGHT), left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 25, shadowOpacity: 0.15 },
    dragHandleWrapper: { alignItems: 'center', paddingVertical: 12 },
    dragHandle: { width: 45, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 8 },
    dragTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
    idleContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 30 },
    placeName: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
    placeSub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    mainNavBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
    modeSelector: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 4, marginBottom: 20 },
    modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
    modeTabActive: { backgroundColor: '#fff', elevation: 3, shadowOpacity: 0.1, shadowRadius: 4 },
    modeLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
    modeLabelActive: { color: '#1E293B' },
    statsCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, paddingVertical: 18, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, marginBottom: 20 },
    statItem: { flex: 1, alignItems: 'center' },
    statIconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    statLabelText: { fontSize: 8, fontWeight: 'bold', color: '#94A3B8' },
    statValueText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
    stepSection: { paddingBottom: 20 },
    sectionTitle: { fontSize: 19, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
    stepRow: { flexDirection: 'row', minHeight: 70 },
    stepIndicator: { width: 40, alignItems: 'center' },
    stepIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    activeIconCircle: { backgroundColor: '#3B82F6' },
    stepLine: { width: 2, position: 'absolute', top: 32, bottom: -10, backgroundColor: '#F1F5F9', zIndex: 1 },
    stepContent: { flex: 1, paddingLeft: 12 },
    stepInstruction: { fontSize: 15, fontWeight: '600', color: '#1E293B', lineHeight: 22 },
    stepMeta: { fontSize: 13, color: '#64748B', marginTop: 3 },
    stickyActionArea: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#F1F5F9', gap: 10 },
    startBtn: { backgroundColor: '#3B82F6', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    stopBtn: { backgroundColor: '#EF4444', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    googleBtn: { height: 58, borderRadius: 18, borderWidth: 1.5, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    googleBtnText: { color: '#1E293B', fontWeight: 'bold', fontSize: 15 },
});