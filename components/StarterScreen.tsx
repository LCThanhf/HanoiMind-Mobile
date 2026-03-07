import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface StarterScreenProps {
    onLoginPress: () => void;
    onSignUpPress: () => void;
}

export const StarterScreen: React.FC<StarterScreenProps> = ({ onLoginPress, onSignUpPress }) => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="items-center pt-12 pb-3 border-b border-gray-100">
                <Text
                    className="text-gray-700 text-[17px] font-semibold text-center"
                    style={{ letterSpacing: 0.3 }}
                >
                    Welcome
                </Text>
            </View>

            {/* Center Content */}
            <View className="flex-1 items-center justify-center px-10">
                {/* Logo Circle Avatar */}
                <View
                    className="items-center justify-center mb-7"
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        backgroundColor: '#F0F7FF',
                    }}
                >
                    <View
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: 35,
                            backgroundColor: '#2B8EF0',
                        }}
                    />
                </View>

                {/* App Name */}
                <Text
                    className="text-[#22C55E] text-[34px] font-bold text-center mb-4"
                    style={{ fontWeight: 'bold', letterSpacing: 0.5 }}
                >
                    HanoiMind
                </Text>

                {/* Tagline */}
                <Text
                    className="text-gray-500 text-[15px] text-center"
                    style={{ lineHeight: 24, fontFamily: 'Georgia', letterSpacing: 0.1 }}
                >
                    Lên kế hoạch, quản lý và tận hưởng{'\n'}những chuyến đi tuyệt vời cùng bạn bè.
                </Text>
            </View>

            {/* Bottom Buttons & Footer */}
            <View className="px-6 pb-10">
                {/* Sign Up Button */}
                <TouchableOpacity
                    className="w-full rounded-lg items-center justify-center mb-3"
                    style={{
                        backgroundColor: '#2B8EF0',
                        paddingVertical: 16,
                    }}
                    activeOpacity={0.85}
                    onPress={onSignUpPress}
                >
                    <Text
                        className="text-white text-[16px]"
                        style={{ fontFamily: 'Georgia', fontWeight: '600', letterSpacing: 0.2 }}
                    >
                        Chưa có tài khoản  →
                    </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                    className="w-full rounded-lg items-center justify-center border border-gray-200"
                    style={{ paddingVertical: 15 }}
                    activeOpacity={0.7}
                    onPress={onLoginPress}
                >
                    <Text
                        className="text-gray-800 text-[16px]"
                        style={{ fontFamily: 'Georgia', fontWeight: '600', letterSpacing: 0.2 }}
                    >
                        Đã có tài khoản
                    </Text>
                </TouchableOpacity>

                {/* Footer Caption */}
                <View className="flex-row items-center justify-center mt-5">
                    <Svg width={14} height={14} viewBox="0 0 24 24" style={{ marginRight: 5 }}>
                        <Circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
                        <Path
                            d="M9 12l2 2 4-4"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </Svg>
                    <Text
                        className="text-gray-400 text-[11px] tracking-widest"
                        style={{ fontFamily: 'Georgia', textTransform: 'uppercase' }}
                    >
                        Ready for Adventure?
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};
