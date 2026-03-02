import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface SignInScreenProps {
    onNavigateToSignUp: () => void;
    onLogin?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigateToSignUp, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View className="bg-white rounded-[24px] p-8 py-12 w-full shadow-xl elevation-[8]">
            <Text className="text-[22px] font-bold text-[#0D5F5E] text-center mb-10">Chào mừng bạn quay trở lại</Text>

            <View className="w-full">
                <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-[14px] text-base text-gray-700 mb-4 bg-white"
                    placeholder="enter email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-[14px] text-base text-gray-700 mb-4 bg-white"
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity className="self-end mb-8">
                    <Text className="text-gray-500 text-sm underline">Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-[#0F7376] rounded-[24px] py-4 items-center mb-6"
                    activeOpacity={0.8}
                    onPress={onLogin}
                >
                    <Text className="text-white text-base font-semibold">Sign In</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <Text className="text-gray-400 text-sm">Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={onNavigateToSignUp}>
                        <Text className="text-gray-400 text-sm">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
