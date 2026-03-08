import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Pressable } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// Days options
const daysOptions = ['1 ngày', '2 ngày', '3 ngày', '4 ngày', '5 ngày', '6 ngày', '7 ngày', '10 ngày', '14 ngày'];

// Mood options data
const moodOptions = [
    {
        id: 'reset',
        title: 'Reset & Healing',
        budget: '500k - 800k/ngày',
        icon: 'healing',
        color: '#22C55E',
        bgColor: '#ECFDF5',
    },
    {
        id: 'chill',
        title: 'Chill & Cafe',
        budget: '400k - 700k/ngày',
        icon: 'cafe',
        color: '#2B8EF0',
        bgColor: '#EBF5FF',
    },
    {
        id: 'explore',
        title: 'Explore Nature',
        budget: '600k - 900k/ngày',
        icon: 'nature',
        color: '#D4A574',
        bgColor: '#FEF3E2',
    },
    {
        id: 'food',
        title: 'Food & Local',
        budget: '800k - 1.2M/ngày',
        icon: 'food',
        color: '#EF4444',
        bgColor: '#FEE2E2',
    },
];

// Icon components
const HealingIcon = ({ color = '#22C55E' }: { color?: string }) => (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 8c3-3 6-3 9 0s6 3 9 0"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <Path
            d="M3 14c3-3 6-3 9 0s6 3 9 0"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
    </Svg>
);

const CafeIcon = ({ color = '#2B8EF0' }: { color?: string }) => (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
            d="M17 8h1a4 4 0 0 1 0 8h-1"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M6 1v3M10 1v3M14 1v3"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
    </Svg>
);

const NatureIcon = ({ color = '#D4A574' }: { color?: string }) => (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
            d="M6.5 21c3-3.5 6-5 9.5-5 0-4-1.5-9-9.5-12 0 6 .5 9 3 13"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M6 12c2-1 4-1.5 6-1.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
    </Svg>
);

const FoodIcon = ({ color = '#EF4444' }: { color?: string }) => (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M7 2v20"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <Path
            d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const CalendarIcon = ({ color = '#2B8EF0' }: { color?: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke={color}
            strokeWidth="1.5"
        />
        <Path
            d="M16 2v4M8 2v4M3 10h18"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </Svg>
);

const MoneyIcon = ({ color = '#2B8EF0' }: { color?: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
        <Path
            d="M12 6v12M9 9.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5S14.33 11 13.5 11h-3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </Svg>
);

const ChevronDownIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M6 9l6 6 6-6"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const SparkleIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="white"
        />
    </Svg>
);

export const CreateTripScreen = ({ onClose }: { onClose?: () => void }) => {
    const [currentStep] = useState(1);
    const [selectedDays, setSelectedDays] = useState('2 ngày');
    const [showDaysDropdown, setShowDaysDropdown] = useState(false);
    const [budget, setBudget] = useState('');
    const [budgetFocused, setBudgetFocused] = useState(false);
    const [selectedMood, setSelectedMood] = useState('reset');
    const [isSoloMode, setIsSoloMode] = useState(true);

    const getMoodIcon = (iconType: string, color: string) => {
        switch (iconType) {
            case 'healing':
                return <HealingIcon color={color} />;
            case 'cafe':
                return <CafeIcon color={color} />;
            case 'nature':
                return <NatureIcon color={color} />;
            case 'food':
                return <FoodIcon color={color} />;
            default:
                return <HealingIcon color={color} />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-12 pb-4">
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="#374151"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </TouchableOpacity>
                <Text className="text-[17px] text-gray-900" style={{ fontWeight: '600' }}>
                    Tạo Chuyến Đi Mới
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <Pressable onPress={() => showDaysDropdown && setShowDaysDropdown(false)}>
                {/* Step Indicator */}
                <View className="flex-row items-center justify-center px-10 py-6">
                    {/* Step 1 */}
                    <View className="items-center">
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: currentStep >= 1 ? '#2B8EF0' : 'transparent',
                                borderWidth: currentStep >= 1 ? 0 : 1.5,
                                borderColor: '#D1D5DB',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text
                                className="text-[13px]"
                                style={{
                                    color: currentStep >= 1 ? 'white' : '#9CA3AF',
                                    fontWeight: '600',
                                }}
                            >
                                1
                            </Text>
                        </View>
                        <Text
                            className="text-[10px] mt-1.5"
                            style={{
                                color: currentStep >= 1 ? '#2B8EF0' : '#9CA3AF',
                                fontWeight: '500',
                            }}
                        >
                            THÔNG TIN
                        </Text>
                    </View>

                    {/* Line 1-2 */}
                    <View
                        style={{
                            flex: 1,
                            height: 1.5,
                            backgroundColor: currentStep >= 2 ? '#2B8EF0' : '#E5E7EB',
                            marginHorizontal: 8,
                            marginBottom: 18,
                        }}
                    />

                    {/* Step 2 */}
                    <View className="items-center">
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: currentStep >= 2 ? '#2B8EF0' : 'transparent',
                                borderWidth: currentStep >= 2 ? 0 : 1.5,
                                borderColor: '#D1D5DB',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text
                                className="text-[13px]"
                                style={{
                                    color: currentStep >= 2 ? 'white' : '#9CA3AF',
                                    fontWeight: '600',
                                }}
                            >
                                2
                            </Text>
                        </View>
                        <Text
                            className="text-[10px] mt-1.5"
                            style={{
                                color: currentStep >= 2 ? '#2B8EF0' : '#9CA3AF',
                                fontWeight: '500',
                            }}
                        >
                            XÁC THỰC
                        </Text>
                    </View>

                    {/* Line 2-3 */}
                    <View
                        style={{
                            flex: 1,
                            height: 1.5,
                            backgroundColor: currentStep >= 3 ? '#2B8EF0' : '#E5E7EB',
                            marginHorizontal: 8,
                            marginBottom: 18,
                        }}
                    />

                    {/* Step 3 */}
                    <View className="items-center">
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: currentStep >= 3 ? '#2B8EF0' : 'transparent',
                                borderWidth: currentStep >= 3 ? 0 : 1.5,
                                borderColor: '#D1D5DB',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text
                                className="text-[13px]"
                                style={{
                                    color: currentStep >= 3 ? 'white' : '#9CA3AF',
                                    fontWeight: '600',
                                }}
                            >
                                3
                            </Text>
                        </View>
                        <Text
                            className="text-[10px] mt-1.5"
                            style={{
                                color: currentStep >= 3 ? '#2B8EF0' : '#9CA3AF',
                                fontWeight: '500',
                            }}
                        >
                            AI TẠO
                        </Text>
                    </View>
                </View>

                {/* Basic Info Section */}
                <View className="px-5">
                    <View className="flex-row items-center mb-4">
                        <View
                            style={{
                                width: 4,
                                height: 20,
                                backgroundColor: '#2B8EF0',
                                borderRadius: 2,
                                marginRight: 10,
                            }}
                        />
                        <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                            NHẬP THÔNG TIN CƠ BẢN
                        </Text>
                    </View>

                    {/* Days Dropdown */}
                    <View className="mb-3 relative">
                        <View className="flex-row items-center mb-2">
                            <CalendarIcon />
                            <Text className="text-[13px] text-gray-600 ml-2" style={{ fontWeight: '500' }}>
                                Số ngày hành trình
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center justify-between px-4"
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: showDaysDropdown ? '#2B8EF0' : '#E5E7EB',
                                height: 52,
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                borderBottomLeftRadius: showDaysDropdown ? 0 : 12,
                                borderBottomRightRadius: showDaysDropdown ? 0 : 12,
                                borderBottomWidth: showDaysDropdown ? 0 : 1,
                            }}
                            onPress={() => setShowDaysDropdown(!showDaysDropdown)}
                            activeOpacity={0.7}
                        >
                            <Text className="text-[15px] text-gray-900" style={{ fontWeight: '500' }}>
                                {selectedDays}
                            </Text>
                            <ChevronDownIcon />
                        </TouchableOpacity>
                        
                        {/* Dropdown List */}
                        {showDaysDropdown && (
                            <View
                                className="absolute left-0 right-0 bg-white overflow-hidden"
                                style={{
                                    top: 78,
                                    borderWidth: 1,
                                    borderTopWidth: 0,
                                    borderColor: '#2B8EF0',
                                    borderBottomLeftRadius: 12,
                                    borderBottomRightRadius: 12,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 4,
                                    zIndex: 1000,
                                }}
                            >
                                <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled={true}>
                                    {daysOptions.map((days, index) => (
                                        <TouchableOpacity
                                            key={days}
                                            className="px-4 py-3.5"
                                            style={{
                                                backgroundColor: selectedDays === days ? '#EBF5FF' : 'white',
                                                borderBottomWidth: index < daysOptions.length - 1 ? 1 : 0,
                                                borderBottomColor: '#F3F4F6',
                                            }}
                                            onPress={() => {
                                                setSelectedDays(days);
                                                setShowDaysDropdown(false);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                className="text-[15px]"
                                                style={{
                                                    color: selectedDays === days ? '#2B8EF0' : '#374151',
                                                    fontWeight: selectedDays === days ? '600' : '500',
                                                }}
                                            >
                                                {days}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Budget Input */}
                    <View className="mb-1">
                        <View className="flex-row items-center mb-2">
                            <MoneyIcon />
                            <Text className="text-[13px] text-gray-600 ml-2" style={{ fontWeight: '500' }}>
                                Tổng ngân sách dự kiến
                            </Text>
                        </View>
                        <View
                            className="flex-row items-center px-4 rounded-xl"
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: budgetFocused ? '#2B8EF0' : '#E5E7EB',
                                height: 52,
                            }}
                        >
                            <TextInput
                                className="flex-1 text-[15px]"
                                style={{ fontWeight: '500', color: '#111827', paddingLeft: 0, paddingRight: 0 }}
                                placeholder="VD: 2.000.000"
                                placeholderTextColor="#9CA3AF"
                                value={budget}
                                onChangeText={setBudget}
                                onFocus={() => setBudgetFocused(true)}
                                onBlur={() => setBudgetFocused(false)}
                                keyboardType="numeric"
                            />
                            <Text className="text-[14px] text-gray-500" style={{ fontWeight: '600' }}>
                                VND
                            </Text>
                        </View>
                    </View>
                    <Text className="text-[11px] text-gray-400 mb-6" style={{ fontWeight: '400' }}>
                        Ngân sách tối thiểu từ 500.000 VND
                    </Text>
                </View>

                {/* Mood Selection Section */}
                <View className="px-5 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View
                                style={{
                                    width: 4,
                                    height: 20,
                                    backgroundColor: '#2B8EF0',
                                    borderRadius: 2,
                                    marginRight: 10,
                                }}
                            />
                            <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                                CHỌN TÂM TRẠNG
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: isSoloMode ? '#EBF5FF' : '#F3F4F6',
                                borderWidth: 1,
                                borderColor: isSoloMode ? '#2B8EF0' : '#E5E7EB',
                            }}
                            onPress={() => setIsSoloMode(!isSoloMode)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className="text-[11px]"
                                style={{
                                    color: isSoloMode ? '#2B8EF0' : '#6B7280',
                                    fontWeight: '600',
                                }}
                            >
                                Solo Mode
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Mood Cards Grid */}
                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
                        {moodOptions.map((mood) => {
                            const isSelected = selectedMood === mood.id;
                            return (
                                <TouchableOpacity
                                    key={mood.id}
                                    style={{
                                        width: '50%',
                                        paddingHorizontal: 6,
                                        marginBottom: 12,
                                    }}
                                    onPress={() => setSelectedMood(mood.id)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="items-center py-5 rounded-2xl relative"
                                        style={{
                                            backgroundColor: mood.bgColor,
                                            borderWidth: isSelected ? 2 : 1,
                                            borderColor: isSelected ? '#2B8EF0' : '#E5E7EB',
                                        }}
                                    >
                                        {/* Checkmark for selected */}
                                        {isSelected && (
                                            <View
                                                className="absolute items-center justify-center"
                                                style={{
                                                    top: 8,
                                                    right: 8,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 10,
                                                    backgroundColor: '#2B8EF0',
                                                }}
                                            >
                                                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                                    <Path
                                                        d="M5 13l4 4L19 7"
                                                        stroke="white"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </Svg>
                                            </View>
                                        )}
                                        
                                        {/* Icon in white rounded square */}
                                        <View
                                            className="items-center justify-center mb-3"
                                            style={{
                                                width: 52,
                                                height: 52,
                                                borderRadius: 14,
                                                backgroundColor: 'white',
                                            }}
                                        >
                                            {getMoodIcon(mood.icon, mood.color)}
                                        </View>
                                        <Text
                                            className="text-[14px] mb-1"
                                            style={{
                                                color: '#1F2937',
                                                fontWeight: '600',
                                            }}
                                        >
                                            {mood.title}
                                        </Text>
                                        <Text
                                            className="text-[11px]"
                                            style={{
                                                color: '#6B7280',
                                                fontWeight: '400',
                                            }}
                                        >
                                            {mood.budget}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Bottom padding */}
                <View className="h-24" />
                </Pressable>
            </ScrollView>

            {/* Bottom Action Button */}
            <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-white">
                <TouchableOpacity
                    className="flex-row items-center justify-center py-4 rounded-2xl"
                    style={{
                        backgroundColor: '#2B8EF0',
                        shadowColor: '#2B8EF0',
                        shadowOpacity: 0.10,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 5,
                    }}
                    activeOpacity={0.85}
                >
                    <SparkleIcon />
                    <Text
                        className="text-white text-[16px] ml-2"
                        style={{ fontWeight: '600' }}
                    >
                        TẠO HÀNH TRÌNH
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
