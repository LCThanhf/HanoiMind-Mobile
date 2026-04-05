import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Bell, Plus, MessageSquare, ArrowLeft } from 'lucide-react-native';
import { ForumPostCard } from '../Forum/ForumPostCard'; // Đường dẫn component Card
import { ForumTopTabs } from '../Forum/ForumTopTabs'; // Đường dẫn component Tab
import { ForumPost, ForumCategory, PostStatus, PostSortBy } from '../../services/forumService/forum.type';
import { ForumService } from '../../services/forumService/forum.service';
import { UsersService } from '../../services/userService/user.service';
import { AppColors } from '../../utils/theme';  
import { DateUtils } from '../../utils/dateUtils';

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
      setUserName(user?.fullName || user.fullName || "Bạn");
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
        category: currentCategory,
      });

      const postsData = response.data || [];
      // console.log('[ForumScreen] fetchPosts', { currentCategory, count: postsData.length, postsData });

      // Thay vì console.log(postsData)
      console.table(postsData.map(post => ({ 
          ID: post._id, 
          Title: post.title, 
          Category: post.category,
          Status: post.status 
      })));

      // Chỉ hiển thị đúng category, không fallback sang tất cả để tránh nhầm lẫn nội dung tab
      setPosts(postsData);

      if (postsData.length === 0) {
        setError('Chưa có bài viết ở danh mục này.');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải bài viết');
      setPosts([]);
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


    // console.log('--- ĐIỀU TRA FORUM SCREEN ---');
    // console.log('ForumTopTabs:', !!ForumTopTabs);
    // console.log('SearchInput:', !!SearchInput);
    // console.log('Button:', !!Button);
    // console.log('Plus Icon:', !!Plus);
return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      {/* 1. HEADER CHÍNH */}
      <View className="flex-row items-center px-4 py-2 bg-white">
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-lg text-primary mr-6">Diễn đàn du lịch</Text>
      </View>

      <View className="bg-gray-50 flex-1">
        {/* 2. TOP TABS */}
        <ForumTopTabs
          activeCategory={currentCategory}
          onCategoryChange={(category) => setCurrentCategory(category)}
        />

        {/* 3. GREETING */}
        <View className="p-4 bg-white">
          <Text className="text-primary font-extrabold text-2xl">Chào buổi sáng, {userName}! 👋</Text>
          <Text className="text-gray-400 text-sm mt-1">Khám phá những hành trình thú vị hôm nay.</Text>
        </View>

        {/* 4. SEARCH BAR */}
        <View className="px-4 py-2 bg-white">
          {/* Bọc SearchInput trong View để xử lý style mà không lo lỗi TS */}
          <View className="rounded-2xl bg-gray-50 overflow-hidden">
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm bài viết, địa điểm..."
              // Không truyền className vào đây nữa
            />
          </View>
        </View>

        {/* 5. MAIN FEED */}
        {loading ? (
          <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={AppColors.status.info} /></View>
        ) : (
          <FlatList
            data={displayedPosts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ForumPostCard post={item} />}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View className="py-8 items-center">
                <View className="w-10 h-1 bg-gray-200 rounded-full mb-4" />
                <Text className="text-gray-400 text-[11px] italic">Bạn đã xem hết tin mới nhất rồi!</Text>
              </View>
            }
          />
        )}
      </View>

      {/* 6. FAB & MODAL (Giữ nguyên logic của bạn) */}
      <Button
        className="absolute bottom-10 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-xl shadow-primary/40"
        onPress={() => {
          // TODO: mở form tạo bài viết
          alert('Tính năng tạo bài viết đang phát triển');
        }}
      >
        <Plus size={30} color="white" />
      </Button>
    </SafeAreaView>
  );
};

export default ForumScreen;