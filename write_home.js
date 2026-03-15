const fs = require('fs');
const content = import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Image, Modal, TouchableWithoutFeedback, Dimensions, TextInput, ImageBackground } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { BottomTabBar, MainTab } from './BottomTabBar';

const myTrips = [
    {
        id: '1',
        title: 'Hà Nội [Chill]',
        location: 'Hà Nội, Việt Nam',
        status: 'Diễn ra trong 2 ngày',
        days: '3 ngày',
        tag: 'Chill',
        type: 'Solo',
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: '2',
        title: 'Hà Nội [Chill]',
        location: 'Hà Nội, Việt Nam',
        status: 'Diễn ra trong 2 ngày',
        days: '3 ngày',
        tag: 'Chill',
        type: 'Solo',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
    },
];

const places = [
    {
        id: 'p1',
        name: 'Phở bò Hà Nội',
        rating: 4.7,
        distance: '2 km',
        reviews: '18K',
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 'p2',
        name: 'Phở bò Hà Nội',
        rating: 4.7,
        distance: '2 km',
        reviews: '18K',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
    },
];

const StarRating = ({ rating, total = 5 }) => (
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
}) => {
    const avatarRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const dropdownOpacity = useRef(new Animated.Value(0)).current;
    const dropdownTranslateY = useRef(new Animated.Value(-8)).current;

    const [searchText, setSearchText] = useState('');

    return (
        <SafeAreaView className="flex-1 bg-[#F5F6FA]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 pt-8 pb-4">
                    <View className="flex-1 justify-center">
                        <Text className="text-[#22C55E] text-[28px] font-bold mb-1" style={{ fontWeight: '900' }}>
                            HanoiMind
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-gray-900 text-[20px] font-bold mr-2">Chào mừng, username!</Text>
                        </View>
                        <TouchableOpacity className="mt-1 flex-row" activeOpacity={0.7}>
                           <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Circle cx="5" cy="5" r="2" fill="#9CA3AF" />
                                <Circle cx="12" cy="5" r="2" fill="#9CA3AF" />
                                <Circle cx="19" cy="5" r="2" fill="#9CA3AF" />
                                <Circle cx="5" cy="12" r="2" fill="#9CA3AF" />
                                <Circle cx="12" cy="12" r="2" fill="#9CA3AF" />
                                <Circle cx="19" cy="12" r="2" fill="#9CA3AF" />
                                <Circle cx="5" cy="19" r="2" fill="#9CA3AF" />
                                <Circle cx="12" cy="19" r="2" fill="#9CA3AF" />
                                <Circle cx="19" cy="19" r="2" fill="#9CA3AF" />
                           </Svg>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Avatar Block */}
                    <TouchableOpacity
                        className="ml-2 mt-4"
                        activeOpacity={0.8}
                        onPress={() => {
                            avatarRef.current?.measureInWindow((x, y, width, height) => {
                                const screenWidth = Dimensions.get('window').width;
                                setDropdownPos({ top: y + height + 4, right: screenWidth - x - width });
                                dropdownOpacity.setValue(0);
                                dropdownTranslateY.setValue(-8);
                                setShowDropdown(true);
                                Animated.parallel([
                                    Animated.timing(dropdownOpacity, {
                                        toValue: 1,
                                        duration: 280,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(dropdownTranslateY, {
                                        toValue: 0,
                                        duration: 280,
                                        useNativeDriver: true,
                                    }),
                                ]).start();
                            });
                        }}
                    >
                        <View ref={avatarRef}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }}
                                style={{ width: 44, height: 44, borderRadius: 22 }}
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Dropdown Menu */}
                <Modal
                    visible={showDropdown}
                    transparent
                    animationType="none"
                    onRequestClose={() => setShowDropdown(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
                        <View style={{ flex: 1 }}>
                            <TouchableWithoutFeedback>
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        top: dropdownPos.top,
                                        right: dropdownPos.right,
                                        backgroundColor: 'white',
                                        borderRadius: 14,
                                        minWidth: 180,
                                        shadowColor: '#000',
                                        shadowOpacity: 0.12,
                                        shadowRadius: 16,
                                        shadowOffset: { width: 0, height: 4 },
                                        elevation: 8,
                                        borderWidth: 1,
                                        borderColor: '#F3F4F6',
                                        overflow: 'hidden',
                                        opacity: dropdownOpacity,
                                        transform: [{ translateY: dropdownTranslateY }],
                                    }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        onPress={() => { setShowDropdown(false); onOpenProfile?.(); }}
                                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
                                    >
                                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                                            <Circle cx="12" cy="8" r="4" stroke="#374151" strokeWidth="1.8" />
                                            <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" />
                                        </Svg>
                                        <Text style={{ fontSize: 15, color: '#111827', fontWeight: '500' }}>Hồ sơ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        onPress={() => { setShowDropdown(false); onLogout?.(); }}
                                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
                                    >
                                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                                            <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M16 17l5-5-5-5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            <Path d="M21 12H9" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                        <Text style={{ fontSize: 15, color: '#EF4444', fontWeight: '500' }}>Đăng xuất</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

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
                                            <Text className="text-white text-[20px] font-bold mb-2 ml-1">C</Text>
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
                        <TouchableOpacity className="bg-[#DCFCE7] px-4 py-1.5 rounded-full mr-2">
                            <Text className="text-[#16A34A] text-[13px] font-bold">All</Text>
                        </TouchableOpacity>
                        {['Nhà hàng', 'Khách sạn', 'Thắng cảnh', 'Bar'].map(chip => (
                            <TouchableOpacity key={chip} className="bg-gray-100 px-4 py-1.5 rounded-full mr-2 border border-gray-200">
                                <Text className="text-gray-600 text-[13px] font-medium">{chip}</Text>
                            </TouchableOpacity>
                        ))}
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

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5" contentContainerStyle={{ paddingRight: 20 }}>
                        {places.map(place => (
                            <TouchableOpacity key={place.id} className="w-[160px] mr-4 bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm">
                                <Image source={{ uri: place.image }} className="w-full h-[100px]" />
                                <View className="px-3 py-3">
                                    <Text className="text-gray-900 text-[14px] font-bold mb-1" numberOfLines={1}>{place.name}</Text>
                                    <StarRating rating={place.rating} />
                                    <View className="flex-row items-center mt-2 justify-between">
                                        <View className="flex-row items-center">
                                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-1">
                                                <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#6B7280" />
                                            </Svg>
                                            <Text className="text-gray-500 text-[12px]">{place.distance}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-1">
                                                <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                                <Circle cx="9" cy="7" r="4" stroke="#6B7280" strokeWidth="1.5" />
                                            </Svg>
                                            <Text className="text-gray-500 text-[12px]">{place.reviews}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
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
                    
                    {myTrips.map(trip => (
                        <TouchableOpacity key={trip.id} className="bg-white rounded-[20px] mb-3 flex-row p-2.5 border border-[#F3F4F6] shadow-sm">
                            <View className="relative w-[110px] h-[110px]">
                                <Image source={{ uri: trip.image }} className="w-full h-full rounded-xl" />
                                <View className="absolute top-2 left-2 bg-[#2B8EF0] px-2 py-0.5 rounded-full">
                                    <Text className="text-white text-[10px] font-bold">{trip.type}</Text>
                                </View>
                            </View>
                            <View className="flex-1 ml-3 py-1 flex-col justify-between">
                                <View className="flex-row justify-between items-start">
                                    <Text className="text-gray-900 text-[15px] font-bold flex-1 pr-2">{trip.title}</Text>
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
                                    <Text className="text-gray-500 text-[11px]">{trip.location}</Text>
                                </View>
                                
                                <View className="mt-2 self-start border border-[#2B8EF0] rounded-full px-3 py-1">
                                    <Text className="text-[#2B8EF0] text-[11px] font-medium">{trip.status}</Text>
                                </View>
                                
                                <View className="flex-row items-center mt-2">
                                    <View className="flex-row items-center mr-3">
                                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="mr-1.5">
                                            <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#2B8EF0" strokeWidth="1.5" />
                                            <Path d="M16 2v4M8 2v4M3 10h18" stroke="#2B8EF0" strokeWidth="1.5" strokeLinecap="round" />
                                        </Svg>
                                        <Text className="text-gray-600 text-[12px] font-medium">{trip.days}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="mr-1.5">
                                            <Circle cx="12" cy="12" r="9" stroke="#22C55E" strokeWidth="1.5" />
                                            <Path d="M12 5L9 12h6L12 5z" fill="#22C55E" />
                                        </Svg>
                                        <Text className="text-gray-600 text-[12px] font-medium">{trip.tag}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <BottomTabBar
                activeTab={activeNavTab}
                onTabChange={(tab) => {
                    onTabChange?.(tab);
                    if (tab === 'profile') {
                        onOpenProfile?.();
                    }
                }}
            />
        </SafeAreaView>
    );
};

fs.writeFileSync('components/HomeScreen.tsx', content);
console.log('Done!');
