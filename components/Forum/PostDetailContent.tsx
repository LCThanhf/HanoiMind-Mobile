import React, { useState } from 'react';
import { View, Text, Image, FlatList, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface PostDetailContentProps {
  images: string[];
  title: string;
  content: string;
  tags: string[];
}

export const PostDetailContent = ({ images, title, content, tags }: PostDetailContentProps) => {
  const imageList = Array.isArray(images) && images.length > 0
    ? images
    : ['https://www.svgrepo.com/show/432141/no-image.svg'];

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  return (
    <View className="bg-white">
      <View className="h-72 bg-gray-100">
        <FlatList
          data={imageList}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: screenWidth, height: 288 }}
              className="rounded-[28px]"
              resizeMode="cover"
            />
          )}
        />
      </View>

      <View className="flex-row justify-center items-center gap-2 mt-3 mb-4">
        {imageList.map((_, index) => (
          <View
            key={index}
            className={index === activeIndex ? 'w-2 h-2 rounded-full bg-primary' : 'w-2 h-2 rounded-full bg-gray-300'}
          />
        ))}
      </View>

      <View className="px-4 pb-4 space-y-4">
        <View className="flex-row flex-wrap gap-2">
          {tags.map((tag, index) => (
            <View key={index} className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              <Text className="text-[11px] text-gray-500">#{tag}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text className="text-2xl font-bold text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-500 mt-2">Bài viết chi tiết đầy đủ</Text>
        </View>

        <View>
          <Text className="text-base text-gray-700 leading-7">{content}</Text>
        </View>
      </View>
    </View>
  );
};
