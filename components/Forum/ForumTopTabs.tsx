
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type TabType = 'FEED' | 'CREATE' | 'BUDDY';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const ForumTopTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'FEED', label: 'Diễn đàn' },
    { id: 'CREATE', label: 'Tạo bài viết' },
    { id: 'BUDDY', label: 'Tìm bạn' },
  ];

  return (
    <View className="flex-row justify-around bg-white py-2 border-b border-gray-100">
      {tabs.map((tab) => (
        <TouchableOpacity 
          key={tab.id} 
          onPress={() => onTabChange(tab.id)}
          className={`pb-2 px-4 ${activeTab === tab.id ? 'border-b-2 border-green-500' : ''}`}
        >
          <Text className={`font-semibold ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};