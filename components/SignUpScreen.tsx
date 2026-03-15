import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Gọi service
import { AuthService } from '../services/authService/auth.service';

interface SignUpScreenProps {
    onNavigateToSignIn: () => void;
    onBack?: () => void;
    onSignUp?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToSignIn, onBack, onSignUp }) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState(''); // Thêm state cho họ tên nếu CreateUserDto yêu cầu
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        // 1. Validate cơ bản
        if (!email || !password || !confirmPassword) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Thông báo', 'Mật khẩu phải từ 8 ký tự trở lên');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Thông báo', 'Xác nhận mật khẩu không khớp');
            return;
        }

        setLoading(true);
        try {
            // 2. Gọi API đăng ký
            // Backend của bạn yêu cầu CreateUserDto (email, password, fullName)
            const response = await AuthService.register({
                email: email.trim(),
                password: password,
                //thêm fullName nếu có, nếu không thì backend sẽ tự lấy phần trước @ của email làm fullName
                fullName: fullName || email.split('@')[0], 
            });

            // 3. Lưu tokens vào AsyncStorage
            await AsyncStorage.setItem('accessToken', response.access_token);
            await AsyncStorage.setItem('refreshToken', response.refresh_token);

            Alert.alert('Thành công', 'Tài khoản của bạn đã được tạo!');

            if (onSignUp) {
                onSignUp();
            }
        } catch (error: any) {
            // Xử lý lỗi từ backend 
            const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            Alert.alert('Lỗi đăng ký', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-center pt-12 pb-3 border-b border-gray-100 relative">
                <TouchableOpacity className="absolute left-4 top-12" onPress={onBack} activeOpacity={0.7}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M15 18l-6-6 6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>
                <Text className="text-gray-900 text-[17px] font-semibold">Đăng ký</Text>
            </View>

            {/* Content */}
            <View className="flex-1 px-6 pt-8">
                <Text className="text-gray-900 text-[28px] font-bold mb-3">Bắt đầu hành trình</Text>
                <Text className="text-gray-500 text-[15px] mb-8">
                    Tạo tài khoản để khám phá và lập kế hoạch cho những chuyến đi mơ ước của bạn.
                </Text>

                {/* Full Name Input */}
                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Họ và tên</Text>
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-4 bg-gray-50">
                    <TextInput
                        className="flex-1 py-4 px-3 text-[15px] text-gray-900"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChangeText={setFullName}
                        editable={!loading}
                    />
                </View>

                {/* Email Input */}
                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Email</Text>
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-4 bg-gray-50">
                    <TextInput
                        className="flex-1 py-4 px-3 text-[15px] text-gray-900"
                        placeholder="name@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                    />
                </View>

                {/* Password Input */}
                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Mật khẩu</Text>
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-1 bg-gray-50">
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

                {/* Helper text */}
                {password.length > 0 && password.length < 8 && (
                    <Text className="text-gray-500 text-[13px] mb-4">Mật khẩu phải từ 8 ký tự trở lên</Text>
                )}
                {(password.length === 0 || password.length >= 8) && <View className="mb-4" />}

                {/* Confirm Password Input */}
                <Text className="text-gray-900 text-[15px] font-semibold mb-2">Xác nhận mật khẩu</Text>
                <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-8 bg-gray-50">
                    <TextInput
                        className="flex-1 py-4 px-3 text-[15px] text-gray-900"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Text>{showConfirmPassword ? 'Hiện' : 'Ẩn'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                    className={`w-full rounded-lg items-center justify-center mb-4 ${loading ? 'opacity-70' : ''}`}
                    style={{ backgroundColor: '#2B8EF0', paddingVertical: 16 }}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[16px] font-semibold">Đăng ký</Text>}
                </TouchableOpacity>

                {/* Bottom Section */}
                <View className="items-center">
                    <Text className="text-gray-600 text-[15px] mb-3">Bạn đã có tài khoản?</Text>
                    <TouchableOpacity
                        className="w-full rounded-lg items-center justify-center border border-gray-200"
                        style={{ paddingVertical: 14 }}
                        onPress={onNavigateToSignIn}
                    >
                        <Text className="text-[#2B8EF0] text-[16px] font-semibold">Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};