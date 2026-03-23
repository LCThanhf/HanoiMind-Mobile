// src/screens/forum/ForumScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Search, Bell, Plus, MessageSquare, ArrowLeft } from 'lucide-react-native';
import { ForumPostCard } from '../Forum/ForumPostCard'; // Đường dẫn component Card
import { ForumTopTabs } from '../Forum/ForumTopTabs'; // Đường dẫn component Tab
import { ForumPost, ForumCategory, PostStatus } from '../../services/forumService/forum.type';

// --- MOCK DATA (Dữ liệu giả để preview) ---
const MOCK_POSTS: ForumPost[] = [
  {
    _id: '1',
    title: 'Hành trình chinh phục cực Bắc - Lũng Cú, Hà Giang',
    content: 'Một chuyến đi đầy cảm xúc với những cung đường đèo hiểm trở nhưng vô cùng hùng vĩ...',
    images: ['https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=800'],
    category: ForumCategory.EXPERIENCE,
    tag: ['HaGiang', 'Travel2024'],
    place_ids: ['lung_cu'],
    stats: { likes: 342, views: 1250, comments: 56 },
    author: { id: 'u1', fullName: 'Minh Hoàng', avatar: 'https://i.pravatar.cc/150?u=1' },
    is_pinned: true,
    status: PostStatus.PUBLISHED,
    created_at: '2 giờ trước',
    updated_at: '1 giờ trước'
  },
  {
    _id: '2',
    title: 'Review quán cafe ẩn mình trong ngõ nhỏ Phố Cổ',
    content: 'Nếu bạn muốn tìm một không gian yên tĩnh để đọc sách và ngắm nhìn phố cổ, đây chính là địa điểm...',
    images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800'],
    category: ForumCategory.REVIEW,
    tag: ['Cafe', 'Hanoi'],
    place_ids: ['pho_co'],
    stats: { likes: 120, views: 890, comments: 24 },
    author: { id: 'u2', fullName: 'Thanh Trúc', avatar: 'https://i.pravatar.cc/150?u=2' },
    is_pinned: false,
    status: PostStatus.PUBLISHED,
    created_at: '5 giờ trước',
    updated_at: '4 giờ trước'
  }
];

const ForumScreen = ({ onBack }: { onBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'FEED' | 'CREATE' | 'BUDDY'>('FEED');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 1. HEADER: Greeting & Icons */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white">
        <TouchableOpacity onPress={onBack} className="p-1">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-blue-500 font-bold text-xl">Chào buổi sáng, Hoàng! 👋</Text>
          <Text className="text-gray-400 text-xs">Khám phá những hành trình thú vị hôm nay.</Text>
        </View>
        <View className="flex-row space-x-3">
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <Bell size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. TOP TABS */}
      <ForumTopTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. SEARCH & FILTER (Chỉ hiện ở tab Diễn đàn) */}
      {activeTab === 'FEED' && (
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
      <FlatList
        data={MOCK_POSTS}
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