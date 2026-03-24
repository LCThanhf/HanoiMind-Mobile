import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { Search, Bell, Plus, MessageSquare, ArrowLeft } from 'lucide-react-native';
import { ForumPostCard } from '../Forum/ForumPostCard'; // Đường dẫn component Card
import { ForumTopTabs } from '../Forum/ForumTopTabs'; // Đường dẫn component Tab
import { ForumPost, ForumCategory, PostStatus, PostSortBy } from '../../services/forumService/forum.type';
import { ForumService } from '../../services/forumService/forum.service';
import { UsersService } from '../../services/userService/user.service';

const ForumScreen = ({ onBack }: { onBack?: () => void }) => {
  const [currentCategory, setCurrentCategory] = useState<ForumCategory>(ForumCategory.REVIEW);
  const [userName, setUserName] = useState<string>('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  

  useEffect(() => {
    fetchUserName();
    fetchPosts();
  }, []);

  const fetchUserName = async () => {
    try {
      const user = await UsersService.getMe();
      setUserName(user.fullName || "USER" );
    } catch (err) {
      console.error('Error fetching user:', err);
      setUserName('Bạn');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ForumService.findAll({
        page: 1,
        limit: 20,
        sortBy: PostSortBy.LATEST,
        category: ForumCategory.EXPERIENCE
      });
      setPosts(response.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-12">
      {/* 1. HEADER: Greeting & Icons */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white">
        <TouchableOpacity onPress={onBack} className="p-1">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-blue-500 font-bold text-xl">Chào buổi sáng, {userName}! 👋</Text>
          <Text className="text-gray-400 text-xs">Khám phá những hành trình thú vị hôm nay.</Text>
        </View>
        <View className="flex-row space-x-3">
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <Bell size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. TOP TABS */}
      {/* <ForumTopTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} /> */}
      <ForumTopTabs 
        activeCategory={currentCategory} 
        onCategoryChange={setCurrentCategory} 
      />

      {/* 3. SEARCH & FILTER (Chỉ hiện ở tab Diễn đàn) */}
      {currentCategory === ForumCategory.REVIEW && (
        <View className="px-4 py-3">
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
            <Search size={18} color="#999" />
            <TextInput 
              placeholder="Tìm kiếm bài viết, địa điểm..." 
              className="flex-1 ml-2 text-sm"
            />
          </View>
        </View>
      )}

      {/* 4. MAIN LIST */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 text-center px-4">{error}</Text>
          <TouchableOpacity className="mt-4 px-4 py-2 bg-blue-500 rounded-lg" onPress={fetchPosts}>
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ForumPostCard post={item} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
              <View className="py-10 items-center">
                  <Text className="text-gray-400 text-xs">Bạn đã xem hết tin mới nhất rồi!</Text>
                  <TouchableOpacity className="mt-2">
                      <Text className="text-blue-500 font-bold">Quay lại đầu trang</Text>
                  </TouchableOpacity>
              </View>
          }
        />
      )}

      {/* 5. FLOATING ACTION BUTTON (Nút đăng bài nhanh) */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-blue-500"
        onPress={() => console.log('Go to Create Post')}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export { ForumScreen };