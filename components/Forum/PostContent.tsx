import React from 'react';
import { View, Text, ImageBackground } from 'react-native';

interface PostContentProps {
  imageUri: string;
  title: string;
  content: string;
  tags: string[];
}

export const PostContent = ({ imageUri, title, content, tags }: PostContentProps) => (
  <>
    <View className="px-4">
      <ImageBackground
        source={{ uri: imageUri }}
        className="w-full h-56 rounded-[24px] overflow-hidden justify-end"
        imageStyle={{ borderRadius: 24 }}
      >
        <View className="bg-black/30 p-4">
          <View className="flex-row space-x-2 mb-2">
            {tags.map((t, index) => (
              <View key={index} className="bg-white/20 px-2 py-0.5 rounded-md border border-white/30">
                <Text className="text-white text-[10px] font-medium">#{t}</Text>
              </View>
            ))}
          </View>
          <Text className="text-white font-bold text-lg" numberOfLines={2}>
            {title}
          </Text>
        </View>
      </ImageBackground>
    </View>
    <View className="p-4 pb-0">
      <Text className="text-gray-600 text-sm leading-5" numberOfLines={2}>
        {content}
      </Text>
    </View>
  </>
);