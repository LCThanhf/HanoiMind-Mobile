import React, { ReactNode } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthLayoutProps {
    children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <SafeAreaView className="flex-1 bg-[#0F7376]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 z-10"
            >
                <ScrollView
                    contentContainerClassName="flex-grow justify-center items-center px-5 pt-10 pb-[200px]"
                    bounces={false}
                >
                    {/* Main content area containing the white card */}
                    <View className="w-full max-w-[400px]">
                        {children}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom background decorative image */}
            <View className="absolute bottom-0 left-0 right-0 h-[250px] z-[1] opacity-80">
                {/* Using a placeholder for the hot air balloons */}
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=800&auto=format&fit=crop' }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                {/* Multi-layered overlay to blend the image into the background better */}
                <View className="absolute inset-0 bg-[#0F7376]/40" />
            </View>
        </SafeAreaView>
    );
};
