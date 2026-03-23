import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, MapPin, Globe, Users, Lock } from 'lucide-react-native';

export const CreatePostScreen = () => {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-gray-400 mb-2">Nội dung câu chuyện</Text>
      <TextInput 
        multiline
        placeholder="Chia sẻ trải nghiệm thú vị của bạn về chuyến đi..."
        className="text-lg text-gray-800 min-h-[150px] textAlignVertical-top"
      />

      {/* Hashtags Section */}
      <View className="mt-6">
        <Text className="font-bold mb-3"># Hashtags</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <TouchableOpacity className="bg-blue-100 px-4 py-2 rounded-full mr-2 flex-row items-center border border-blue-200">
            <Text className="text-blue-600 mr-1">#Hanoi</Text>
            <Text className="text-blue-600">×</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full flex-row items-center">
            <Plus size={16} color="#666" />
            <Text className="ml-1 text-gray-600">Thêm</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Ai có thể xem bài viết? */}
      <View className="mt-8">
        <Text className="font-bold mb-4">Ai có thể xem bài viết?</Text>
        <View className="flex-row justify-between">
          <PrivacyOption icon={<Globe size={20} color="#3b82f6" />} label="Công khai" active />
          <PrivacyOption icon={<Users size={20} color="#666" />} label="Bạn bè" />
          <PrivacyOption icon={<Lock size={20} color="#666" />} label="Riêng tư" />
        </View>
      </View>

      <TouchableOpacity className="bg-blue-500 rounded-xl py-4 mt-10 items-center">
        <Text className="text-white font-bold text-lg">Đăng bài viết</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const PrivacyOption = ({ icon, label, active = false }: any) => (
  <TouchableOpacity className={`items-center p-4 rounded-2xl w-[30%] border ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
    {icon}
    <Text className={`mt-2 text-xs ${active ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>{label}</Text>
  </TouchableOpacity>
);