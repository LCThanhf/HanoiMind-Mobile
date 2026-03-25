import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ChatService from '../services/chatService/chat.service';
import { JourneyService } from '../services/journeyService/journey.service';
import { UsersService } from '../services/userService/user.service';

interface ChatListScreenProps {
  onChatClick: (roomId: string, chatName: string) => void;
}

// ==========================================
// COMPONENT CON: Xử lý hiển thị từng dòng Chat
// ==========================================
const ChatItem = ({ item, currentUserId, onChatClick }: { item: any, currentUserId: string, onChatClick: Function }) => {
  const [chatName, setChatName] = useState(() => item.type === 'JOURNEY' ? 'Đang tải chuyến đi...' : 'Đang tải người dùng...');
  const [avatarUrl, setAvatarUrl] = useState('https://ui-avatars.com/api/?name=Chat&background=random');

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        // --- LOGIC NHÓM CHUYẾN ĐI ---
        if (item.type === 'JOURNEY' && item.journey_id) {
          const journey: any = await JourneyService.findOne(item.journey_id);
          if (journey) {
            setChatName(journey.title || journey.name || 'Nhóm Chuyến đi');
            setAvatarUrl(journey.image || journey.cover_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(journey.title || 'J')}&background=random`);
          }
        } 
        
        // --- LOGIC TIN NHẮN CÁ NHÂN (Theo đúng yêu cầu của bạn) ---
        else if (item.type === 'DIRECT' && item.participant_ids) {
          
          // BƯỚC 2: Lọc participant_ids để lấy ID của "người còn lại" (khác với ID bản thân)
          const partnerId = item.participant_ids.find((id: string) => id !== currentUserId);
          
          if (partnerId) {
            // BƯỚC 3: Dùng ID người còn lại gọi API getPublicProfile
            const userProfile: any = await UsersService.getPublicProfile(partnerId);
            
            if (userProfile) {
              const name = userProfile.fullName || userProfile.full_name || userProfile.name || 'Người dùng ẩn danh';
              setChatName(name);
              setAvatarUrl(userProfile.avatar || userProfile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`);
            }
          } else {
            setChatName('Mình (Ghi chú cá nhân)');
            setAvatarUrl('https://ui-avatars.com/api/?name=Me&background=random');
          }
        }
      } catch (error) {
        console.log(`❌ Lỗi tải thông tin cho phòng ${item._id}:`, error);
        setChatName(item.type === 'JOURNEY' ? 'Nhóm Chuyến đi' : 'Tin nhắn cá nhân');
      }
    };

    // Chỉ thực thi logic tìm tên nếu currentUserId đã sẵn sàng
    if (currentUserId) {
      fetchDetailData();
    }
  }, [item, currentUserId]);

  const roomId = item._id;
  const lastMessage = item.last_message && item.last_message !== '[undefined]' ? item.last_message : 'Chưa có tin nhắn nào...';
  const timeString = item.updated_at ? new Date(item.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => roomId && onChatClick(roomId, chatName)}
      className="flex-row items-center p-4 border-b border-gray-100 bg-white"
    >
      <Image source={{ uri: avatarUrl }} className="w-14 h-14 rounded-full bg-gray-200" />
      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>{chatName}</Text>
          <Text className="text-xs text-gray-500">{timeString}</Text>
        </View>
        <Text className="text-sm text-gray-500" numberOfLines={1}>{lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ==========================================
// MÀN HÌNH CHÍNH
// ==========================================
export const ChatListScreen = ({ onChatClick }: ChatListScreenProps) => {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); 

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // BƯỚC 1: Lấy profile bản thân để có currentUserId
        const myProfile = await UsersService.getMe();
        if (myProfile && myProfile._id) {
            setCurrentUserId(myProfile._id);
        } else {
            const storedUserId = await AsyncStorage.getItem('userId');
            setCurrentUserId(storedUserId); 
        }

        // Sau khi đã có currentUserId, mới tiến hành lấy danh sách phòng chat
        const data = await ChatService.getConversations();
        setConversations(data || []);

      } catch (error) {
        console.error('Lỗi khởi tạo dữ liệu chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();
    ChatService.connect(); 
  }, []);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: 70 }}>
      <View className="px-5 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Tin nhắn</Text>
      </View>

      {/* Chỉ render list khi loading xong để đảm bảo đã có ID bản thân */}
      {loading || currentUserId === null ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2B8EF0" />
          <Text className="mt-2 text-gray-500 text-sm">Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <ChatItem 
              item={item} 
              currentUserId={currentUserId} 
              onChatClick={onChatClick} 
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-500">Bạn chưa có cuộc trò chuyện nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};