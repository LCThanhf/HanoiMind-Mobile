import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

import ChatService from '../../services/chatService/chat.service';
import { JourneyService } from '../../services/journeyService/journey.service';
import { UsersService } from '../../services/userService/user.service';

interface ChatListScreenProps {
  onChatClick: (roomId: string, chatName: string) => void;
}

// ==========================================
// COMPONENT CON: Danh sách Avatar ngang (Dữ liệu bóc từ Conversations)
// ==========================================
const ActiveUsersList = ({ currentUser, users, onUserClick }: { currentUser: any, users: any[], onUserClick: Function }) => {
  // Gộp "You" vào đầu danh sách
  const listData = [
    { isYou: true, ...currentUser, fullName: 'You' },
    ...(users || [])
  ];

  return (
    <View className="py-2 mb-2 border-b border-gray-50">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={listData}
        keyExtractor={(item, index) => item._id?.toString() || item.id?.toString() || index.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
        renderItem={({ item }) => {
          const avatarUrl = item.avatar || item.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName || 'U')}&background=random`;
          const displayName = item.fullName || item.name || 'User';

          return (
            <TouchableOpacity 
              className="items-center mr-6" 
              activeOpacity={0.8}
              onPress={() => {
                if (!item.isYou) onUserClick(item);
              }}
            >
              <View className="relative">
                <Image 
                  source={{ uri: avatarUrl }} 
                  className="w-16 h-16 rounded-full border border-gray-200"
                  style={{ backgroundColor: '#E5E7EB' }} 
                />
                
                {item.isYou && (
                  <View className="absolute bottom-0 right-0 bg-primary w-5 h-5 rounded-full border-2 border-white items-center justify-center">
                    <Text className="text-white font-bold" style={{ fontSize: 14, lineHeight: 15 }}>+</Text>
                  </View>
                )}

                {!item.isYou && (
                  <View className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white bg-success" />
                )}
              </View>
              <Text className="text-xs font-medium text-gray-800 mt-2" numberOfLines={1} style={{ maxWidth: 64 }}>
                {displayName.split(' ')[displayName.split(' ').length - 1]}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

// ==========================================
// COMPONENT CON: Xử lý hiển thị từng dòng Chat (Lịch sử)
// ==========================================
const ChatItem = ({ item, currentUserId, onChatClick }: { item: any, currentUserId: string | null, onChatClick: Function }) => {
  const [chatName, setChatName] = useState(() => item.type === 'JOURNEY' ? 'Đang tải chuyến đi...' : 'Đang tải người dùng...');
  const [avatarUrl, setAvatarUrl] = useState('https://ui-avatars.com/api/?name=Chat&background=random');

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        if (item.type === 'JOURNEY' && item.journey_id) {
          const journey: any = await JourneyService.findOne(item.journey_id);
          if (journey) {
            setChatName(journey.title || journey.name || 'Nhóm Chuyến đi');
            setAvatarUrl(journey.image || journey.cover_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(journey.title || 'J')}&background=random`);
          }
        } 
        else if (item.type === 'DIRECT' && item.participant_ids) {
          const partnerId = item.participant_ids.find((id: string) => id !== currentUserId);
          
          if (partnerId) {
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
      className="flex-row items-center p-4 border-b border-gray-50 bg-white mx-2 rounded-2xl mb-1"
    >
      <Image source={{ uri: avatarUrl }} className="w-14 h-14 rounded-full bg-gray-200" />
      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>{chatName}</Text>
          <Text className="text-xs text-gray-400">{timeString}</Text>
        </View>
        <Text className="text-sm text-gray-500" numberOfLines={1}>{lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ==========================================
// COMPONENT CON: Xử lý hiển thị kết quả tìm kiếm User
// ==========================================
const SearchUserItem = ({ user, onStartChat }: { user: any, onStartChat: Function }) => {
  const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=random`;
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onStartChat(user)}
      className="flex-row items-center p-4 border-b border-gray-100 bg-white"
    >
      <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full bg-gray-200" />
      <View className="flex-1 ml-4 justify-center">
        <Text className="text-base font-semibold text-gray-900">{user.fullName}</Text>
        {user.bio ? (
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>{user.bio}</Text>
        ) : null}
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
  const [activeUsers, setActiveUsers] = useState<any[]>([]); 
  const [myProfile, setMyProfile] = useState<any>(null);     

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); 

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // 1. Lấy thông tin cá nhân
        const profile = await UsersService.getMe();
        let myId = profile?._id ;
        
        if (myId) {
            setMyProfile(profile);
            setCurrentUserId(myId);
        } else {
            myId = (await AsyncStorage.getItem('userId')) as string;
            setCurrentUserId(myId); 
        }

        // 2. Lấy danh sách cuộc trò chuyện
        const chatData = await ChatService.getConversations();
        setConversations(chatData || []);

        // 👉 LỌC NGƯỜI DÙNG TỪ DANH SÁCH CHAT ĐỂ ĐƯA LÊN THANH ACTIVE
        if (chatData && chatData.length > 0 && myId) {
          // Chỉ lấy các cuộc trò chuyện cá nhân (DIRECT)
          const directChats = chatData.filter((chat: any) => chat.type === 'DIRECT' && chat.participant_ids);
          
          // Dùng Promise.all để lấy profile nhanh hơn
          const fetchPromises = directChats.map(async (chat: any) => {
            const partnerId = chat.participant_ids.find((id: string) => id !== myId);
            if (partnerId) {
              try {
                const userProfile: any = await UsersService.getPublicProfile(partnerId);
                if (userProfile) {
                  // Gắn kèm _roomId vào profile để khi bấm có thể mở luôn chat
                  return { ...userProfile, _roomId: chat._id };
                }
              } catch (error) {
                console.log(`Lỗi tải profile user ${partnerId} cho list ngang:`, error);
              }
            }
            return null;
          });

          const resolvedProfiles = await Promise.all(fetchPromises);
          
          // Lọc bỏ null và lọc trùng lặp (nếu có 2 phòng với cùng 1 người)
          const validProfiles = resolvedProfiles.filter(p => p !== null);
          const uniqueProfiles = Array.from(new Map(validProfiles.map(item => [item._id || item.id, item])).values());
          
          setActiveUsers(uniqueProfiles);
        }

      } catch (error) {
        console.error('Lỗi khởi tạo dữ liệu chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();
    ChatService.connect(); 
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearchLoading(true);
        try {
          const results = await UsersService.searchUsers(searchQuery.trim());
          setSearchResults(results || []);
        } catch (error) {
          console.error("Lỗi tìm kiếm người dùng", error);
        } finally {
          setIsSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Xử lý khi bấm vào user (tìm kiếm hoặc thanh ngang)
  const handleStartDirectChat = async (targetUser: any) => {
    try {
      setSearchQuery(''); 
      
      // 👉 NẾU bấm từ thanh ngang đã có sẵn _roomId thì mở luôn
      if (targetUser._roomId) {
        onChatClick(targetUser._roomId, targetUser.fullName || targetUser.name);
        return;
      }

      // Nếu search mới chưa có phòng thì gọi API tạo
      const room = await ChatService.createDirectChat(targetUser.id || targetUser._id); 
      if (room && room._id) {
        onChatClick(room._id, targetUser.fullName || targetUser.name);
      }
    } catch (error) {
      console.error('Lỗi khi bắt đầu chat:', error);
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top, paddingBottom: 70 }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#16A34A' }}>Tin nhắn</Text>
      </View>

      <View className="px-5 mb-4">
        <View
          className="flex-row items-center px-4 rounded-2xl"
          style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 46 }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
            <Path
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <TextInput
            placeholder="Tìm kiếm người dùng..."
            placeholderTextColor="#9CA3AF"
            style={{ flex: 1, fontSize: 14, color: '#111827' }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Text className="text-gray-400 text-base font-bold">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        isSearchLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="small" color="#2B8EF0" />
            <Text className="mt-2 text-gray-500 text-sm">Đang tìm kiếm...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
            renderItem={({ item }) => (
              <SearchUserItem user={item} onStartChat={handleStartDirectChat} />
            )}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-20">
                <Text className="text-gray-500">Không tìm thấy người dùng nào.</Text>
              </View>
            }
          />
        )
      ) : (
        loading || currentUserId === null ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2B8EF0" />
            <Text className="mt-2 text-gray-500 text-sm">Đang tải tin nhắn...</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
            ListHeaderComponent={
              <ActiveUsersList 
                currentUser={myProfile} 
                users={activeUsers} 
                onUserClick={handleStartDirectChat} 
              />
            }
            renderItem={({ item }) => (
              <ChatItem 
                item={item} 
                currentUserId={currentUserId || ''} 
                onChatClick={onChatClick} 
              />
            )}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-10">
                <Text className="text-gray-500">Bạn chưa có cuộc trò chuyện nào.</Text>
              </View>
            }
          />
        )
      )}
    </View>
  );
};
