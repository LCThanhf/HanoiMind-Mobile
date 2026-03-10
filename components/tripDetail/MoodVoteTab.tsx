import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export const MoodVoteTab = () => {
    return (
        <View className="px-5 items-center py-12">
            <View
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: '#EBF5FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                }}
            >
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
                        stroke="#2B8EF0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </View>
            <Text className="text-[16px] text-gray-900 mb-2" style={{ fontWeight: '700' }}>
                Mood Vote
            </Text>
            <Text className="text-[13px] text-center" style={{ color: '#9CA3AF', fontWeight: '400', lineHeight: 20 }}>
                Tính năng bình chọn tâm trạng{'\n'}sẽ sớm ra mắt!
            </Text>
        </View>
    );
};
