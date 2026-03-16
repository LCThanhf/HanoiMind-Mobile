import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Dimensions, Image, Modal, Text,
    TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { UsersService } from '../services/userService/user.service';

interface AppHeaderProps {
    onOpenProfile: () => void;
    onLogout: () => void;
}

export const AppHeader = ({ onOpenProfile, onLogout }: AppHeaderProps) => {
    const [userAvatar, setUserAvatar] = useState('');
    const [userName, setUserName] = useState('');

    const avatarRef = useRef<View>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const dropdownOpacity = useRef(new Animated.Value(0)).current;
    const dropdownTranslateY = useRef(new Animated.Value(-8)).current;

    useEffect(() => {
        UsersService.getMe()
            .then(user => {
                setUserAvatar(user.avatar || '');
                setUserName(user.fullName || '');
            })
            .catch(() => { });
    }, []);

    const openDropdown = () => {
        avatarRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
            const screenWidth = Dimensions.get('window').width;
            setDropdownPos({ top: y + height + 4, right: screenWidth - x - width });
            dropdownOpacity.setValue(0);
            dropdownTranslateY.setValue(-8);
            setShowDropdown(true);
            Animated.parallel([
                Animated.timing(dropdownOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
                Animated.timing(dropdownTranslateY, { toValue: 0, duration: 280, useNativeDriver: true }),
            ]).start();
        });
    };

    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16 }}>
                <View>
                    <Text style={{ color: '#22C55E', fontSize: 28, fontWeight: '900', lineHeight: 34 }}>HanoiMind</Text>
                    <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                        Chào mừng, {userName || 'bạn'}!
                    </Text>
                </View>

                <TouchableOpacity activeOpacity={0.8} onPress={openDropdown}>
                    <View ref={avatarRef}>
                        <Image
                            source={{ uri: userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }}
                            style={{ width: 44, height: 44, borderRadius: 22 }}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <Modal visible={showDropdown} transparent animationType="none" onRequestClose={() => setShowDropdown(false)}>
                <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback>
                            <Animated.View style={{
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
                            }}>
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => { setShowDropdown(false); onOpenProfile(); }}
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
                                    onPress={() => { setShowDropdown(false); onLogout(); }}
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
        </>
    );
};
