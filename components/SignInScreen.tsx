import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import service
import { AuthService } from '../services/authService/auth.service';

interface SignInScreenProps {
    onNavigateToSignUp: () => void;
    onBack?: () => void;
    onLogin?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigateToSignUp, onBack, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberLogin, setRememberLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hydrateSavedCredentials = async () => {
            try {
                const raw = await AsyncStorage.getItem('savedLoginCredentials');
                if (!raw) return;
                const saved = JSON.parse(raw);
                if (saved?.email) setEmail(saved.email);
                if (saved?.password) setPassword(saved.password);
                setRememberLogin(Boolean(saved?.remember));
            } catch {
                // no-op
            }
        };

        hydrateSavedCredentials();
    }, []);

    const handleSignIn = async () => {
        // 1. Validate
        if (!email || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        setLoading(true);
        try {
            // 2. Gọi API login
            const response = await AuthService.login({
                email: email.trim(),
                password: password
            });

            // 3. Lưu tokens vào bộ nhớ
            await AsyncStorage.setItem('accessToken', response.access_token);
            await AsyncStorage.setItem('refreshToken', response.refresh_token);

            if (rememberLogin) {
                await AsyncStorage.setItem(
                    'savedLoginCredentials',
                    JSON.stringify({
                        email: email.trim(),
                        password,
                        remember: true,
                    })
                );
            } else {
                await AsyncStorage.removeItem('savedLoginCredentials');
            }

            Alert.alert('Thành công', `Chào mừng ${response.fullName} quay trở lại!`);

            // 4. Kích hoạt logic điều hướng của code cũ thông qua prop
            if (onLogin) {
                onLogin();
            }

        } catch (error: any) {
            // Lấy message lỗi từ backend nếu có
            const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            Alert.alert('Lỗi đăng nhập', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-center pt-12 pb-3 border-b border-gray-100 relative">
                <TouchableOpacity className="absolute left-4 top-12" onPress={onBack}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M15 18l-6-6 6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>
                <Text className="text-gray-900 text-[17px] font-semibold">Đăng nhập</Text>
            </View>

            <View className="flex-1 px-6 pt-8">
                <Text className="text-gray-900 text-[28px] font-bold mb-3">Chào mừng trở lại!</Text>
                <Text className="text-gray-500 text-[15px] mb-8">
                    Hãy đăng nhập để tiếp tục những chuyến phiêu lưu tuyệt vời cùng BeroTravel.
                </Text>

                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Email</Text>
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-4 bg-gray-50">
                    <TextInput
                        className="flex-1 py-4 px-3 text-[15px] text-gray-900"
                        placeholder="name@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        editable={!loading}
                    />
                </View>

                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-900 text-[15px] font-semibold">Mật khẩu</Text>
                </View>
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-8 bg-gray-50">
                    <TextInput
                        className="flex-1 py-4 px-3 text-[15px] text-gray-900"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Text>{showPassword ? 'Hiện' : 'Ẩn'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="flex-row items-center mb-6"
                    activeOpacity={0.75}
                    onPress={() => setRememberLogin((prev) => !prev)}
                    disabled={loading}
                >
                    <View
                        style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            borderWidth: 1.5,
                            borderColor: rememberLogin ? '#2B8EF0' : '#D1D5DB',
                            backgroundColor: rememberLogin ? '#2B8EF0' : 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                        }}
                    >
                        {rememberLogin ? (
                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                <Path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        ) : null}
                    </View>
                    <Text className="text-[13px] text-gray-600" style={{ fontWeight: '500' }}>
                        Ghi nhớ tài khoản và mật khẩu trên thiết bị này
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`w-full rounded-lg items-center justify-center mb-6 ${loading ? 'opacity-70' : ''}`}
                    style={{ backgroundColor: '#2B8EF0', paddingVertical: 16 }}
                    onPress={handleSignIn}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[16px] font-semibold">Đăng nhập</Text>}
                </TouchableOpacity>

                <View className="flex-row items-center justify-center">
                    <Text className="text-gray-600 text-[15px]">Bạn chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={onNavigateToSignUp}>
                        <Text className="text-[#2B8EF0] text-[15px] font-semibold">Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};