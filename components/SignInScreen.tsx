import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SignInScreenProps {
    onNavigateToSignUp: () => void;
    onBack?: () => void;
    onLogin?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigateToSignUp, onBack, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-center pt-12 pb-3 border-b border-gray-100 relative">
                <TouchableOpacity
                    className="absolute left-4 top-12"
                    onPress={onBack}
                    activeOpacity={0.7}
                >
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M15 18l-6-6 6-6"
                            stroke="#374151"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </TouchableOpacity>
                <Text className="text-gray-900 text-[17px] font-semibold">Đăng nhập</Text>
            </View>

            {/* Content */}
            <View className="flex-1 px-6 pt-8">
                <Text className="text-gray-900 text-[28px] font-bold mb-3" style={{ fontWeight: 'bold' }}>
                    Chào mừng trở lại!
                </Text>
                <Text className="text-gray-500 text-[15px] mb-8" style={{ lineHeight: 22 }}>
                    Hãy đăng nhập để tiếp tục những chuyến phiêu lưu tuyệt vời cùng HanoiMind.
                </Text>

                {/* Email Label */}
                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Email</Text>

                {/* Email Input */}
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-4 bg-gray-50">
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <TextInput
                        className="flex-1 py-4 px-3 text-[15px] text-gray-900"
                        placeholder="name@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password Label */}
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-900 text-[15px] font-semibold">Mật khẩu</Text>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text className="text-[#2B8EF0] text-[14px]">Quên mật khẩu?</Text>
                    </TouchableOpacity>
                </View>

                {/* Password Input */}
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-8 bg-gray-50">
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <TextInput
                        className="flex-1 py-4 px-3 text-[15px] text-gray-900"
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            {showPassword ? (
                                <Path
                                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                                    stroke="#9CA3AF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ) : (
                                <Path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z"
                                    stroke="#9CA3AF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                    className="w-full rounded-lg items-center justify-center mb-6"
                    style={{
                        backgroundColor: '#2B8EF0',
                        paddingVertical: 16,
                    }}
                    activeOpacity={0.85}
                    onPress={onLogin}
                >
                    <Text className="text-white text-[16px] font-semibold">Đăng nhập</Text>
                </TouchableOpacity>

                {/* Bottom Link */}
                <View className="flex-row items-center justify-center">
                    <Text className="text-gray-600 text-[15px]">Bạn chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={onNavigateToSignUp} activeOpacity={0.7}>
                        <Text className="text-[#2B8EF0] text-[15px] font-semibold">Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
