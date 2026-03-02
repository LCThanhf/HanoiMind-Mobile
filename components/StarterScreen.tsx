import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

interface StarterScreenProps {
    onLoginPress: () => void;
    onSkipPress: () => void;
}

const { height } = Dimensions.get('window');

export const StarterScreen: React.FC<StarterScreenProps> = ({ onLoginPress, onSkipPress }) => {
    return (
        <View className="flex-1 bg-black">
            {/* Immersive Background Image */}
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop' }}
                className="flex-1 justify-between"
                resizeMode="cover"
            >
                {/* Top/Middle Section: Logo Area */}
                <SafeAreaView className="flex-1 justify-center items-center pb-20">
                    <View className="flex-row items-baseline justify-center">
                        <View className="bg-white/90 px-4 py-1 rounded-2xl mr-2">
                            <Text className="text-[#3A5F4F] text-[40px] font-bold tracking-tight">Hanoi</Text>
                            {/* Suitcase handle mock */}
                            <View className="absolute -top-3 left-[20%] right-[20%] h-3 border-t-[3px] border-l-[3px] border-r-[3px] border-white/90 rounded-t-sm" />
                        </View>
                        <Text className="text-white text-[44px] font-bold tracking-tight shadow-md">Mind</Text>
                    </View>
                    <Text className="text-white/90 italic mt-2 text-sm drop-shadow-md">Oachxalach vo cung</Text>
                </SafeAreaView>

                {/* Bottom Section: White Card Overlay */}
                <View
                    className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 items-center"
                    style={{ minHeight: height * 0.35 }}
                >
                    <Text className="text-[#0D5F5E] text-[26px] font-bold text-center leading-9 mb-8">
                        Luôn đồng hành cùng{'\n'}hành trình của bạn!
                    </Text>

                    <TouchableOpacity
                        className="w-full bg-[#0F7376] rounded-full py-4 flex-row justify-center items-center mb-6"
                        activeOpacity={0.8}
                        onPress={onLoginPress}
                    >
                        <Text className="text-white text-base font-semibold text-center">Đăng nhập ngay </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="pb-2 border-b border-gray-400"
                        activeOpacity={0.6}
                        onPress={onSkipPress}
                    >
                        <Text className="text-gray-600 text-sm">Chưa có tài khoản?</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};
