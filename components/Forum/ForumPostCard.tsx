// src/components/forum/ForumPostCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { MapPin, MessageCircle, Eye, Heart, Navigation } from 'lucide-react-native';
import { ForumPost } from '../../services/forumService/forum.type';

export const ForumPostCard = ({ post }: { post: ForumPost }) => {
  return (
    <View className="bg-white m-4 rounded-3xl shadow-sm overflow-hidden border border-gray-100">
      {/* Header: Author info */}
      <View className="flex-row items-center p-4">
        <Image source={{ uri: post.author.avatar }} className="w-10 h-10 rounded-full" />
        <View className="ml-3 flex-1">
          <Text className="font-bold text-gray-800">{post.author.fullName}</Text>
          <Text className="text-xs text-gray-400">2 giờ trước</Text> 
        </View>
        <View className="bg-green-100 px-2 py-1 rounded-md">
          <Text className="text-[10px] text-green-700 font-bold">CÔNG KHAI</Text>
        </View>
      </View>

      {/* Body: Cover Image with Title Overlay */}
      <View className="px-4">
        <ImageBackground 
          source={{ uri: post.images[0] }} 
          className="w-full h-52 rounded-2xl overflow-hidden justify-end"
          imageStyle={{ borderRadius: 16 }}
        >
          <View className="bg-black/30 p-4">
             <Text className="text-white font-bold text-lg" numberOfLines={2}>
               {post.title}
             </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Content snippet & Tags */}
      <View className="p-4">
        <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>{post.content}</Text>
        
        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full">
            <MapPin size={12} color="#3b82f6" />
            <Text className="text-[10px] text-blue-600 ml-1">Lũng Cú, Hà Giang</Text>
          </View>
          <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
            <Navigation size={12} color="#10b981" />
            <Text className="text-[10px] text-green-600 ml-1">Chuyến đi Hà Giang...</Text>
          </View>
        </View>

        {/* Footer Stats */}
        <View className="flex-row justify-between items-center border-t border-gray-50 pt-3">
          <View className="flex-row space-x-4">
            <StatItem icon={<Heart size={16} color="#666" />} count={post.stats.likes} />
            <StatItem icon={<MessageCircle size={16} color="#666" />} count={post.stats.comments} />
            <StatItem icon={<Eye size={16} color="#666" />} count={post.stats.views} />
          </View>
          <TouchableOpacity>
            <Text className="text-blue-500 font-bold text-xs">Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const StatItem = ({ icon, count }: { icon: any, count: number }) => (
  <View className="flex-row items-center mr-3">
    {icon}
    <Text className="text-xs text-gray-500 ml-1">{count}</Text>
  </View>
);