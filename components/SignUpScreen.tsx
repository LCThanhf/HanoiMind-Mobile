import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SignUpScreenProps {
    onNavigateToSignIn: () => void;
    onBack?: () => void;
    onSignUp?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToSignIn, onBack, onSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                <Text className="text-gray-900 text-[17px] font-semibold">Đăng ký</Text>
            </View>

            {/* Content */}
            <View className="flex-1 px-6 pt-8">
                <Text className="text-gray-900 text-[28px] font-bold mb-3" style={{ fontWeight: 'bold' }}>
                    Bắt đầu hành trình
                </Text>
                <Text className="text-gray-500 text-[15px] mb-8" style={{ lineHeight: 22 }}>
                    Tạo tài khoản để khám phá và lập kế hoạch cho những chuyến đi mơ ước của bạn.
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
                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Mật khẩu</Text>

                {/* Password Input */}
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-1 bg-gray-50">
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

                {/* Password Helper Text - Only show if password is less than 8 characters */}
                {password.length > 0 && password.length < 8 && (
                    <View className="flex-row items-center mb-4 px-1">
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                            <Path
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                        <Text className="text-gray-500 text-[13px]">Mật khẩu phải từ 8 ký tự trở lên</Text>
                    </View>
                )}

                {/* Add spacing when helper text is not shown */}
                {(password.length === 0 || password.length >= 8) && <View className="mb-4" />}

                {/* Confirm Password Label */}
                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Xác nhận mật khẩu</Text>

                {/* Confirm Password Input */}
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
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            {showConfirmPassword ? (
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

                {/* Sign Up Button */}
                <TouchableOpacity
                    className="w-full rounded-lg items-center justify-center mb-4"
                    style={{
                        backgroundColor: '#2B8EF0',
                        paddingVertical: 16,
                    }}
                    activeOpacity={0.85}
                    onPress={onSignUp}
                >
                    <Text className="text-white text-[16px] font-semibold">Đăng ký</Text>
                </TouchableOpacity>

                {/* Bottom Section */}
                <View className="items-center">
                    <Text className="text-gray-600 text-[15px] mb-3">Bạn đã có tài khoản?</Text>
                    <TouchableOpacity
                        className="w-full rounded-lg items-center justify-center border border-gray-200"
                        style={{ paddingVertical: 14 }}
                        activeOpacity={0.7}
                        onPress={onNavigateToSignIn}
                    >
                        <Text className="text-[#2B8EF0] text-[16px] font-semibold">Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
