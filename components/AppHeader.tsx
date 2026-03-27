import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Dimensions, Modal, Text,
    TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { UsersService } from '../services/userService/user.service';
import { AvatarCircle, ListActionRow } from './shared';

interface AppHeaderProps {
    onOpenProfile: () => void;
    onLogout: () => void;
    variant?: 'default' | 'homeTrips';
    onOpenNotifications?: () => void;
}

const ProfileIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="4" stroke="#374151" strokeWidth="1.8" />
        <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
);

const LogoutIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 17l5-5-5-5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M21 12H9" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const AppHeader = ({ onOpenProfile, onLogout, variant = 'default', onOpenNotifications }: AppHeaderProps) => {
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: variant === 'homeTrips' ? 6 : 32, paddingBottom: variant === 'homeTrips' ? 10 : 16 }}>
                <View>
                    <Text style={{ color: '#22C55E', fontSize: variant === 'homeTrips' ? 32 : 28, fontWeight: '900', lineHeight: variant === 'homeTrips' ? 46 : 34 }}>HanoiMind</Text>
                    <Text style={{ color: '#111827', fontSize: variant === 'homeTrips' ? 20 : 16, fontWeight: variant === 'homeTrips' ? '800' : '600', marginTop: variant === 'homeTrips' ? 2 : 2, lineHeight: variant === 'homeTrips' ? 28 : 22 }}>
                        Chào mừng, {userName || 'username'}!
                    </Text>
                </View>

                {variant === 'homeTrips' ? (
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onOpenNotifications}
                            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}
                        >
                            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"
                                    stroke="#111827"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <Path
                                    d="M13.73 21a2 2 0 0 1-3.46 0"
                                    stroke="#111827"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.8} onPress={openDropdown}>
                            <View ref={avatarRef}>
                                <AvatarCircle
                                    uri={userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'}
                                    name={userName}
                                    size={36}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity activeOpacity={0.8} onPress={openDropdown}>
                        <View ref={avatarRef}>
                            <AvatarCircle
                                uri={userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'}
                                name={userName}
                                size={44}
                            />
                        </View>
                    </TouchableOpacity>
                )}
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
                                <ListActionRow
                                    icon={<ProfileIcon />}
                                    title="Hồ sơ"
                                    onPress={() => { setShowDropdown(false); onOpenProfile(); }}
                                    titleSize={15}
                                    titleColor="#111827"
                                    iconContainerBackgroundColor="transparent"
                                    iconContainerSize={18}
                                    horizontalPadding={16}
                                    verticalPadding={14}
                                    borderBottomColor="#F3F4F6"
                                />
                                <ListActionRow
                                    icon={<LogoutIcon />}
                                    title="Đăng xuất"
                                    onPress={() => { setShowDropdown(false); onLogout(); }}
                                    titleSize={15}
                                    titleColor="#EF4444"
                                    iconContainerBackgroundColor="transparent"
                                    iconContainerSize={18}
                                    horizontalPadding={16}
                                    verticalPadding={14}
                                    showBorderBottom={false}
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};
