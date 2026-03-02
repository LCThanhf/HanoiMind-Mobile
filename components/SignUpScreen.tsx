import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface SignUpScreenProps {
    onNavigateToSignIn: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToSignIn }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View className="bg-white rounded-[24px] p-8 py-12 w-full shadow-xl elevation-[8]">
            <Text className="text-[20px] font-bold text-[#0D5F5E] text-center mb-10 leading-7">
                Bắt đầu hành trình của bạn{'\n'}ngay hôm nay
            </Text>

            <View className="w-full">
                <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-[14px] text-base text-gray-700 mb-4 bg-white"
                    placeholder="enter name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

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

                <TouchableOpacity className="bg-[#0F7376] rounded-[24px] py-4 items-center mb-6 mt-4" activeOpacity={0.8}>
                    <Text className="text-white text-base font-semibold">Sign Up</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <Text className="text-gray-400 text-sm">Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={onNavigateToSignIn}>
                        <Text className="text-gray-400 text-sm">Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
