import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, FormInputRow, ScreenHeader } from './shared';

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
            <ScreenHeader title="Đăng ký" onBack={onBack} backIconType="chevron" titleSize={17} horizontalPadding={16} />

            {/* Content */}
            <View className="flex-1 px-6 pt-8">
                <Text className="text-gray-900 text-[28px] font-bold mb-3">Bắt đầu hành trình</Text>
                <Text className="text-gray-500 text-[15px] mb-8">
                    Tạo tài khoản để khám phá và lập kế hoạch cho những chuyến đi mơ ước của bạn.
                </Text>

                <FormInputRow
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!loading}
                    marginBottom={16}
                />

                <FormInputRow
                    label="Email"
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                    marginBottom={16}
                />

                <FormInputRow
                    label="Mật khẩu"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    marginBottom={4}
                    rightSlot={
                        <Button onPress={() => setShowPassword(!showPassword)}>
                            <Text>{showPassword ? 'Hiện' : 'Ẩn'}</Text>
                        </Button>
                    }
                />

                {/* Helper text */}
                {password.length > 0 && password.length < 8 && (
                    <Text className="text-gray-500 text-[13px] mb-4">Mật khẩu phải từ 8 ký tự trở lên</Text>
                )}
                {(password.length === 0 || password.length >= 8) && <View className="mb-4" />}

                <FormInputRow
                    label="Xác nhận mật khẩu"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                    marginBottom={32}
                    rightSlot={
                        <Button onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Text>{showConfirmPassword ? 'Hiện' : 'Ẩn'}</Text>
                        </Button>
                    }
                />

                <Button
                    label="Đăng ký"
                    onPress={handleSignUp}
                    disabled={loading}
                    loading={loading}
                    style={{ marginBottom: 16 }}
                />

                {/* Bottom Section */}
                <View className="items-center">
                    <Text className="text-gray-600 text-[15px] mb-3">Bạn đã có tài khoản?</Text>
                    <Button
                        label="Đăng nhập ngay"
                        variant="secondary"
                        onPress={onNavigateToSignIn}
                        textColor="#2B8EF0"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};