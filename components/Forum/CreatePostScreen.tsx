import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MapPin, Search, X, ChevronRight , Pin } from 'lucide-react-native';
import { Button, ScreenHeader, AvatarCircle } from '../shared';
import { MediaUploadModal, CategorySelectModal, PrivacySelectModal, PostAdditionalOptions, type Category, type PrivacyMode } from './modals';
import { JourneyService } from '../../services/journeyService/journey.service';
import { PlacesService } from '../../services/placeService/place.service';
import { UsersService } from '../../services/userService/user.service';
import { Journey } from '../../services/journeyService/journey.type';
import { Place } from '../../services/placeService/place.type';
import { User } from '../../services/userService/user.type';
import { ForumService } from '../../services/forumService/forum.service';
import { ForumPost } from '../../services/forumService/forum.type';

interface CreatePostScreenProps {
  mode?: 'create' | 'edit';
  post?: ForumPost;
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}

export const CreatePostScreen = ({ mode = 'create', post, onBack, onSubmitSuccess }: CreatePostScreenProps) => {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('public');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // User & Location & Journey state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingJourneys, setLoadingJourneys] = useState(true);

  // Modal state
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headerTitle = mode === 'edit' ? 'Chỉnh sửa bài viết' : 'Bài viết mới';
  const submitLabel = privacyMode === 'draft' ? 'Lưu nháp' : 'Đăng';

  // Load current user & journeys
  useEffect(() => {
    loadUserData();
    fetchUserJourneys();
  }, []);

  // Search places
  useEffect(() => {
    if (placeSearchQuery.trim().length > 0) {
      searchPlaces();
    } else {
      setPlaces([]);
    }
  }, [placeSearchQuery]);

  // Load edit data
  useEffect(() => {
    if (mode === 'edit' && post) {
      loadEditData();
    }
  }, [mode, post]);

  const loadEditData = async () => {
    if (!post) return;

    setTitle(post.title || '');
    setContent(post.content || '');
    setSelectedImages(post.images || []);

    // Map status to privacy
    if (post.status === 'PUBLISHED') setPrivacyMode('public');
    else if (post.status === 'HIDDEN') setPrivacyMode('private');
    else setPrivacyMode('draft');

    // Map category
    const categoryMap: Record<string, Category> = {
      'REVIEW': { id: 'review', label: '⭐ Review' },
      'EXPERIENCE': { id: 'tips', label: '💡 Mẹo & Kinh nghiệm' },
      'FIND_BUDDY': { id: 'story', label: '📖 Tìm bạn đồng hành' },
      'QNA': { id: 'question', label: '❓ Hỏi & Tìm tư vấn' },
      'OTHERS': { id: 'local', label: '💦 Khác' },
    };
    const mappedCategory = categoryMap[post.category];
    if (mappedCategory) {
      setSelectedCategory(mappedCategory);
    }

    // Load place if single
    if (post.place_ids && post.place_ids.length === 1) {
      try {
        const place = await PlacesService.findOne(post.place_ids[0]);
        setSelectedPlace(place);
      } catch (err) {
        console.error('Error loading place:', err);
      }
    }

    // Load journey if exists
    if (post.journey_id) {
      try {
        const journey = await JourneyService.findOne(post.journey_id);
        setSelectedJourney(journey);
      } catch (err) {
        console.error('Error loading journey:', err);
      }
    }
  };

  const loadUserData = async () => {
    try {
      const user = await UsersService.getMe();
      setCurrentUser(user);
    } catch (err) {
      console.error('Lỗi tải user:', err);
    }
  };

  const fetchUserJourneys = async () => {
    try {
      setLoadingJourneys(true);
      const journeyList = await JourneyService.findMy();
      setJourneys(journeyList || []);
    } catch (err) {
      console.error('Lỗi tải hành trình:', err);
    } finally {
      setLoadingJourneys(false);
    }
  };

  const searchPlaces = async () => {
    try {
      setLoadingPlaces(true);
      const response = await PlacesService.findAll({ 
        name: placeSearchQuery,
        limit: 20 
      });
      setPlaces(response?.data || []);
    } catch (err) {
      console.error('Lỗi tìm kiếm địa điểm:', err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleMediaSelected = (imageUrl: string) => {
    if (!selectedImages.includes(imageUrl)) {
      setSelectedImages([...selectedImages, imageUrl]);
    }
  };

  // Map giữa frontend ID và backend enum
  const categoryToBackendMap: Record<string, string> = {
    'review': 'REVIEW',
    'tips': 'EXPERIENCE',
    'story': 'FIND_BUDDY',
    'question': 'QNA',
    'local': 'OTHERS',
  };

const handleSubmit = async (overrideStatus?: 'DRAFT' | 'PUBLISHED') => {
  // Validate cơ bản
  if (!title.trim() || !content.trim()) {
    Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề và nội dung!');
    return;
  }

  try {
    setIsSubmitting(true);

    // Chuẩn bị payload theo CreatePostPayload interface
    let mappedStatus: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
    if (privacyMode === 'public') mappedStatus = 'PUBLISHED';
    else if (privacyMode === 'private') mappedStatus = 'HIDDEN';
    else mappedStatus = 'DRAFT';

    const finalStatus = overrideStatus || mappedStatus;

    // Convert category frontend ID -> backend enum
    const backendCategory = selectedCategory?.id 
      ? categoryToBackendMap[selectedCategory.id] || 'OTHERS'
      : 'OTHERS';

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: backendCategory,
      images: selectedImages,
      place_ids: selectedPlace ? [selectedPlace._id] : [],
      journey_id: selectedJourney?._id,
      status: finalStatus, 
    };

    const result = mode === 'edit' && post 
      ? await ForumService.updatePost(post._id, payload as any)
      : await ForumService.createPost(payload as any);

    if (result) {
      onSubmitSuccess?.();
      Alert.alert(
        'Thành công', 
        finalStatus === 'DRAFT' ? 'Đã lưu bản nháp!' : 'Bài viết của bạn đã được đăng!',
        [{ text: 'OK', onPress: () => onBack?.() }]
      );
    }
  } catch (err) {
    console.error('Lỗi khi xử lý bài viết:', err);
    Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <View className="flex-1 bg-white">
      {/* Header with User Info */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <X size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-center font-bold text-gray-900">{headerTitle}</Text>
        
      <Button
        variant="link"
        label={submitLabel}
        onPress={() => handleSubmit()} // Thay logic cũ bằng hàm này
        disabled={isSubmitting} // Thêm disabled để tránh bấm nhiều lần
        textColor="#2B8EF0"
        textStyle={{ fontWeight: '700', fontSize: 15 }}
      />
      </View>

      {/* User Info Bar */}
      {currentUser && (
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <AvatarCircle 
            name={currentUser.fullName} // Dùng tên để hiện chữ cái đầu dự phòng
            uri={currentUser.avatar}     // Nếu component có nhận ảnh
            size={40} 
          />
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">{currentUser.fullName}</Text>
          </View>
          {/* Nút Ghim chuẩn giao diện mẫu */}
          <TouchableOpacity className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <Pin size={14} color="#f43f5e" fill="#f43f5e" className="rotate-45" /> 
            <Text className="text-[13px] text-gray-600 ml-1.5 font-medium">Ghim</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 mb-4"
          placeholderTextColor="#D1D5DB"
        />

        {/* Content Input */}
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Mùa thu Hà Giang không chỉ có hoa Tam Giác Mạch mà còn có những cung đường uốn lượng trong mây. Chuyến đi này ghi dấu những trải nghiệm vô cùng độc đáo ở Lũng Cú..."
          multiline
          className="min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 textAlignVertical-top mb-6"
          placeholderTextColor="#9CA3AF"
        />

        {/* LOCATION & JOURNEY SECTION */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-green-100 p-1.5">
                <MapPin size={14} color="#10B981" />
              </View>
              <Text className="text-xs font-bold uppercase text-gray-500">Địa điểm & hành trình</Text>
            </View>
            {selectedPlace && (
              <TouchableOpacity 
                onPress={() => setSelectedPlace(null)}
                className="px-3 py-1 rounded-full border border-primary"
              >
                <Text className="text-xs font-semibold text-primary">Thay đổi</Text>
              </TouchableOpacity>
            )}
          </View>

          {!selectedPlace ? (
            <View className="flex-row items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 mb-3">
              <Search size={16} color="#6B7280" />
              <TextInput
                value={placeSearchQuery}
                onChangeText={setPlaceSearchQuery}
                placeholder="Tìm kiếm địa điểm..."
                className="flex-1 text-sm text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ) : null}

          {loadingPlaces && <ActivityIndicator color="#2B8EF0" />}

          {placeSearchQuery.trim().length > 0 && !loadingPlaces && (
            <FlatList
              data={places}
              keyExtractor={(p) => p._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPlace(item);
                    setPlaceSearchQuery('');
                  }}
                  className="flex-row items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50 mb-2"
                >
                  {item.images?.[0] && (
                    <Image source={{ uri: item.images[0] }} className="w-12 h-12 rounded-lg" />
                  )}
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-500">{item.address}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          {selectedPlace && (
            <View className="flex-row items-center gap-3 p-3 rounded-2xl border border-green-200 bg-green-50">
              <MapPin size={16} color="#10B981" />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{selectedPlace.name}</Text>
                <Text className="text-xs text-gray-500">{selectedPlace.address}</Text>
              </View>
            </View>
          )}
        </View>

        {/* JOURNEY SECTION */}
        {!loadingJourneys && journeys.length > 0 && (
          <View className="mb-6">
            <Text className="text-xs font-bold uppercase text-gray-500 mb-3">Hành trình liên kết</Text>

            {!selectedJourney ? (
              <FlatList
                data={journeys}
                keyExtractor={(j) => j._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedJourney(item)}
                    className="flex-row items-center gap-3 p-3 rounded-2xl border border-gray-200 bg-white mb-2"
                  >
                    {item.avatar && (
                      <Image source={{ uri: item.avatar }} className="w-16 h-16 rounded-lg" />
                    )}
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {item.days?.length || 0} ngày {item.days?.length || 0} đêm
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <TouchableOpacity
                onPress={() => setSelectedJourney(null)}
                className="flex-row items-center gap-3 p-3 rounded-2xl border border-gray-200 bg-white"
              >
                {selectedJourney.avatar && (
                  <Image source={{ uri: selectedJourney.avatar }} className="w-16 h-16 rounded-lg" />
                )}
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">{selectedJourney.name}</Text>
                  <Text className="text-xs text-gray-500">
                    {selectedJourney.days?.length || 0} ngày {selectedJourney.days?.length || 0} đêm
                  </Text>
                </View>
                <ChevronRight size={18} color="#D1D5DB" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Additional Options at bottom */}
        <PostAdditionalOptions
          onMediaPress={() => setMediaModalVisible(true)}
          onCategoryPress={() => setCategoryModalVisible(true)}
          onPrivacyPress={() => setPrivacyModalVisible(true)}
          hasImages={selectedImages.length > 0}
          hasCategory={!!selectedCategory}
        />

        <View className="h-4" />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="flex-row gap-3 border-t border-gray-200 bg-white px-4 py-3">
        <Button
          variant="secondary"
          label={isSubmitting ? "..." : "Lưu bản nháp"}
          onPress={() => handleSubmit('DRAFT')} // Gọi hàm lưu nháp
          disabled={isSubmitting}
          style={{ borderRadius: 12, minHeight: 48 }}
          className="flex-1"
        />
        <Button
          label={isSubmitting ? "Đang đăng..." : "Đăng"}
          onPress={() => handleSubmit('PUBLISHED')} // Gọi hàm đăng bài
          disabled={isSubmitting}
          style={{ borderRadius: 12, minHeight: 48 }}
          className="flex-1"
        />
      </View>

      {/* Modals */}
      <MediaUploadModal
        visible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        onMediaSelected={handleMediaSelected}
        selectedImages={selectedImages}
        maxImages={5}
      />

      <CategorySelectModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={(category) => setSelectedCategory(category)}
        selectedCategory={selectedCategory ?? undefined}
        categories={[
          { id: 'REVIEW', label: '⭐ Review' },
          { id: 'EXPERIENCE', label: '💡 Mẹo & Kinh nghiệm' },
          { id: 'FIND_BUDDY', label: '📖 Tìm bạn đồng hành' },
          { id: 'QNA', label: '❓ Hỏi & Tìm tư vấn' },
          { id: 'OTHERS', label: '💦 Khác' },
        ]}
      />

      <PrivacySelectModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        onSelect={setPrivacyMode}
        selectedMode={privacyMode}
      />

    </View>
  );
};


