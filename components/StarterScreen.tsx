import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Button, ScreenHeader } from './shared';

interface StarterScreenProps {
    onLoginPress: () => void;
    onSignUpPress: () => void;
}

export const StarterScreen: React.FC<StarterScreenProps> = ({ onLoginPress, onSignUpPress }) => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="Welcome" showBorder={true} titleSize={17} titleWeight="600" />

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
                <Button
                    label="Chưa có tài khoản"
                    onPress={onSignUpPress}
                    style={{ marginBottom: 12 }}
                    rightSlot={
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
                            <Path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    }
                />

                {/* Login Button */}
                <Button
                    label="Đã có tài khoản"
                    variant="secondary"
                    onPress={onLoginPress}
                    style={{ minHeight: 54 }}
                    textColor="#1F2937"
                />

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
                        Bạn đã sẵn sàng khám phá chưa?
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};
