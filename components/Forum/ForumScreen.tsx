import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Bell, Plus, MessageSquare, ArrowLeft } from 'lucide-react-native';
import { ForumPostCard } from '../Forum/ForumPostCard'; // Đường dẫn component Card
import { ForumTopTabs } from '../Forum/ForumTopTabs'; // Đường dẫn component Tab
import { ForumPost, ForumCategory, PostStatus, PostSortBy } from '../../services/forumService/forum.type';
import { ForumService } from '../../services/forumService/forum.service';
import { UsersService } from '../../services/userService/user.service';

// 1. Thêm các thư viện xử lý ảnh
import * as ImagePicker from 'expo-image-picker';
import { Modal } from 'react-native'; // Để hiện màn hình chờ

// 2. Import cái "nhà máy" xử lý ảnh bạn vừa viết ở file utils
// Nhớ chỉnh lại đường dẫn '../utils/uploadImage' cho đúng chỗ bạn đặt file nhé
import { processImage, upImageToCloudinary } from '../../utils/uploadImage';
import { Button, SearchInput } from '../shared';

const ForumScreen = ({ onBack }: { onBack?: () => void }) => {
  const [currentCategory, setCurrentCategory] = useState<ForumCategory>(ForumCategory.REVIEW);
  const [userName, setUserName] = useState<string>('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');



  useEffect(() => {
    fetchUserName();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentCategory]);

  const fetchUserName = async () => {
    try {
      const user = await UsersService.getMe();
      setUserName(user.fullName || "USER");
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
        limit: 10,
        sortBy: PostSortBy.LATEST,
        category: currentCategory
      });

      const postsData = response.data || [];
      if (postsData.length === 0) {
        // Nếu category hiện tại chưa có bài, thử fetch tất cả để không để trắng
        const fallback = await ForumService.findAll({
          page: 1,
          limit: 10,
          sortBy: PostSortBy.LATEST
        });
        setPosts(fallback.data || []);
      } else {
        setPosts(postsData);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  // 3. Quản lý trạng thái đang upload
  const [isUploading, setIsUploading] = useState(false);

  // 4. Hàm "Phù phép" cho nút Plus
  const handleAddPostWithImage = async () => {
    // Xin quyền
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Bạn cần cho phép truy cập ảnh để dùng tính năng này!');
      return;
    }

    // Mở kho ảnh
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        setIsUploading(true); // Bật vòng xoay chờ đợi

        // Quy trình khoa học: Xử lý nhẹ -> Bắn lên mây
        const processedUri = await processImage(result.assets[0].uri);
        const cloudUrl = await upImageToCloudinary(processedUri);

        if (cloudUrl) {
          console.log("Link ảnh Cloudinary của bạn đây:", cloudUrl);
          alert("Upload thành công! Link ảnh: " + cloudUrl.substring(0, 20) + "...");
          // Sau này bạn dùng link cloudUrl này để post bài nhé!
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false); // Tắt vòng xoay
      }
    }
  };

  const displayedPosts = searchQuery.trim()
    ? posts.filter((post) => {
      const query = searchQuery.trim().toLowerCase();
      const title = ((post as any).title || '').toLowerCase();
      const content = ((post as any).content || '').toLowerCase();
      return title.includes(query) || content.includes(query);
    })
    : posts;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-12">
      {/* 1. HEADER: Greeting & Icons */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white">
        <TouchableOpacity onPress={onBack} className="p-1">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-primary font-bold text-xl">Chào buổi sáng, {userName}!👋</Text>
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

      {/* 3. SEARCH & FILTER */}
      {currentCategory === ForumCategory.EXPERIENCE && (
        <View className="px-4 py-3">
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm bài viết, địa điểm..."
          />
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
          <View className="mt-4 w-[160px]">
            <Button label="Thử lại" onPress={fetchPosts} style={{ minHeight: 44, borderRadius: 10 }} />
          </View>
        </View>
      ) : displayedPosts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 text-center mb-3">
            {searchQuery.trim() ? 'Không tìm thấy bài viết phù hợp.' : 'Hiện chưa có bài viết cho mục này.'}
          </Text>
          {!searchQuery.trim() ? (
            <Text className="text-gray-400 text-center">Đang hiển thị nội dung từ tất cả mục để bạn tham khảo.</Text>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={displayedPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ForumPostCard postId={item._id} post={item} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View className="py-10 items-center">
              <Text className="text-gray-400 text-xs">Bạn đã xem hết tin mới nhất rồi!</Text>
              <TouchableOpacity className="mt-2">
                <Text className="text-primary font-bold">Quay lại đầu trang</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* 5. FLOATING ACTION BUTTON (Nút đăng bài nhanh) */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={handleAddPostWithImage}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>

      {/* 6. Modal chờ đợi khi đang upload ảnh */}
      <Modal transparent visible={isUploading} animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl items-center shadow-xl">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 font-bold text-gray-700">Đang tải ảnh lên...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export { ForumScreen };
