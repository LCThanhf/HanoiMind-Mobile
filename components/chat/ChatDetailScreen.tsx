import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Image, Alert, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatService from '../../services/chatService/chat.service';
import { UsersService } from '../../services/userService/user.service';

// 👉 Đảm bảo import đúng đường dẫn đến file utils của bạn
import { processImage, upImageToCloudinary, getCdnUrl } from '../../utils/uploadImage';

interface ChatDetailScreenProps {
  roomId: string;
  chatName: string;
  onBack: () => void;
  onOpenSettings?: () => void;
  isGroup?: boolean;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export const ChatDetailScreen = ({ roomId, chatName, onBack, onOpenSettings, isGroup = true }: ChatDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  
  const bottomInsetRef = useRef(insets.bottom);
  if (insets.bottom > bottomInsetRef.current) {
    bottomInsetRef.current = insets.bottom;
  }
  const safeBottom = Math.max(bottomInsetRef.current, 12);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const [isCreatePollVisible, setIsCreatePollVisible] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!roomId || roomId === 'undefined') return;

    const initChat = async () => {
      try {
        setLoading(true);

        let userId = await AsyncStorage.getItem('userId');
        if (!userId) {
           const myProfile = await UsersService.getMe();
           userId = myProfile?._id || '';
        }
        setCurrentUserId(userId as string);

        await ChatService.joinRoom({ room_id: roomId });

        const history = await ChatService.getMessages(roomId);
        setMessages(history || []);
        
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
      } catch (error) {
        console.error('Lỗi khởi tạo màn hình Chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    ChatService.onReceiveMessage((newMsg) => {
      setMessages((prev) => {
        const hasRealMsg = prev.some(m => (m._id || m.id) === (newMsg._id ));
        if (hasRealMsg) return prev;

        const matchingLocalIndex = prev.findIndex(m => typeof m._id === 'string' && m._id.startsWith('local_') && m.sender_id === newMsg.sender_id && m.content === newMsg.content);
        if (matchingLocalIndex !== -1) {
          const nextMessages = [...prev];
          nextMessages[matchingLocalIndex] = newMsg;
          return nextMessages;
        } else {
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          return [...prev, newMsg];
        }
      });
    });

    ChatService.onUpdateReaction((data) => {
      setMessages((prev) => prev.map((msg) => {
        const targetId = data.message_id || data._id; 
        const msgId = msg._id || msg.id; 
        if (msgId && targetId && msgId === targetId) return { ...msg, reactions: data.reactions };
        return msg;
      }));
    });

    ChatService.onUpdatePoll((updatedPollMsg) => {
      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => (msg._id || msg.id) !== updatedPollMsg._id);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        return [...filteredMessages, updatedPollMsg];
      });
    });

  }, [roomId]);

  // --- XỬ LÝ GỬI TEXT ---
  const handleSend = () => {
    if (!inputText.trim() || !currentUserId) return;
    const content = inputText.trim();
    setInputText(''); 
    const localId = `local_${Date.now()}`;
    ChatService.sendMessage({ room_id: roomId, content: content, type: 'TEXT' as any });
    
    setMessages((prev) => [...prev, { _id: localId, content, sender_id: currentUserId, type: 'TEXT', created_at: new Date().toISOString(), reactions: [], seen_by: [] }]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // --- XỬ LÝ ẢNH BẰNG CLOUDINARY UTILS ---
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true, 
        quality: 1 // Để chất lượng cao nhất, file util sẽ lo việc nén
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleUploadImage(result.assets[0].uri);
      }
    } catch (error) { 
      console.log('Lỗi chọn ảnh:', error); 
    }
  };

  const handleUploadImage = async (originalUri: string) => {
    setIsUploading(true);
    try {
      // Bước 1: Nén và xử lý kích thước ảnh
      const processedUri = await processImage(originalUri);

      // Bước 2: Gọi API tải lên
      const secureUrl = await upImageToCloudinary(processedUri);

      if (secureUrl) {
        // Bước 3: Gửi tin nhắn chứa ảnh lên socket
        ChatService.sendMessage({ 
          room_id: roomId, 
          content: 'Đã gửi một ảnh', 
          type: 'IMAGE' as any, 
          metadata: { url: secureUrl } 
        });
      } else {
        throw new Error('Không nhận được URL từ Cloudinary');
      }
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng kiểm tra lại mạng hoặc cấu hình.');
    } finally { 
      setIsUploading(false); 
    }
  };

  // --- XỬ LÝ TẠO BÌNH CHỌN ---
  const handleUpdatePollOption = (text: string, index: number) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  const handleAddPollOption = () => setPollOptions([...pollOptions, '']);
  
  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length <= 2) return Alert.alert('Lỗi', 'Cần ít nhất 2 lựa chọn');
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleSendPoll = () => {
    if (!pollQuestion.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập câu hỏi');
    const validOptions = pollOptions.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return Alert.alert('Lỗi', 'Vui lòng nhập ít nhất 2 lựa chọn');

    const optionsData = validOptions.map((text, idx) => ({ id: `opt_${Date.now()}_${idx}`, text: text.trim(), voters: [] }));

    ChatService.sendMessage({
      room_id: roomId,
      content: 'Đã tạo một bình chọn mới',
      type: 'POLL' as any,
      metadata: { question: pollQuestion.trim(), options: optionsData }
    });

    setIsCreatePollVisible(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleVotePoll = (messageId: string, optionId: string) => {
    if (!currentUserId) return;
    ChatService.votePoll(messageId, roomId, optionId);
  };

  const handleReact = (emoji: string, targetId: string) => {
    if (!targetId) return;
    ChatService.reactMessage(targetId, roomId, emoji);
    setMessages((prev) => prev.map((msg) => {
      const msgId = msg._id || msg.id;
      if (msgId === targetId) {
        const filtered = (msg.reactions || []).filter((r: any) => r.userId !== currentUserId);
        return { ...msg, reactions: [...filtered, { userId: currentUserId, emoji }] };
      }
      return msg;
    }));
    setSelectedMessageId(null);
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.sender_id === currentUserId || item.isMine;
    const timeString = item.created_at ? new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    const isSending = typeof item._id === 'string' && item._id.startsWith('local_');
    const msgId = item._id || item.id;
    const isSelected = selectedMessageId === msgId;

    const prevMsg = index > 0 ? messages[index - 1] : null;
    const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
    const showName = !isMe && (!prevMsg || prevMsg.sender_id !== item.sender_id);
    const showAvatar = !isMe && (!nextMsg || nextMsg.sender_id !== item.sender_id);
    const senderName = item.sender?.fullName || item.sender_name || 'Người dùng';
    const senderAvatar = item.sender?.avatar || item.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;

    const hasReactions = item.reactions && item.reactions.length > 0;
    let uniqueEmojis: string[] = [];
    if (hasReactions) uniqueEmojis = Array.from(new Set(item.reactions.map((r: any) => r.emoji))).slice(0, 3) as string[]; 

    const isImage = item.type === 'IMAGE';
    const isPoll = item.type === 'POLL';

    // 👉 RENDER POLL
    if (isPoll && item.metadata) {
      return (
        <View className="w-full items-center my-4 px-4">
          <TouchableOpacity 
            activeOpacity={0.9} 
            onLongPress={() => !isSending && setSelectedMessageId(isSelected ? null : msgId)}
            className="w-full max-w-[320px] bg-white rounded-3xl p-4 border border-gray-100"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
          >
            <View className="flex-row items-start mb-4">
              <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center mr-3 mt-1">
                <Text style={{ fontSize: 18 }}>📊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-[11px] mb-1 uppercase tracking-wider">{senderName} đã tạo bình chọn</Text>
                <Text className="font-bold text-[16px] text-gray-900 leading-6">{item.metadata.question}</Text>
              </View>
            </View>

            {item.metadata.options?.map((opt: any) => {
              const isVoted = opt.voters?.includes(currentUserId);
              const totalVotes = opt.voters?.length || 0;
              return (
                <TouchableOpacity 
                  key={opt.id} 
                  onPress={() => handleVotePoll(msgId, opt.id)}
                  className={`flex-row items-center px-4 py-3.5 mb-2 rounded-2xl border ${
                    isVoted ? 'bg-primary-soft border-primary-border' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <View className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${isVoted ? 'border-primary' : 'border-gray-300'}`}>
                    {isVoted && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </View>
                  <Text className={`flex-1 text-[14px] ${isVoted ? 'font-semibold text-info-strong' : 'text-gray-700'}`}>{opt.text}</Text>
                  {totalVotes > 0 && <Text className="text-[12px] font-bold text-gray-500 ml-2">{totalVotes}</Text>}
                </TouchableOpacity>
              );
            })}

            {hasReactions && (
              <View className="absolute -bottom-3 right-4 bg-white px-2 py-0.5 rounded-full border border-gray-100 flex-row items-center shadow-sm">
                {uniqueEmojis.map((emoji, idx) => <Text key={idx} style={{ fontSize: 12 }}>{emoji}</Text>)}
                {item.reactions.length > 1 && <Text className="text-[10px] font-bold text-gray-500 ml-1">{item.reactions.length}</Text>}
              </View>
            )}
          </TouchableOpacity>

          {isSelected && (
            <View className="flex-row bg-white rounded-full px-3 py-1.5 mt-4 z-10 shadow-sm border border-gray-50">
              {EMOJI_LIST.map((emoji) => (
                <TouchableOpacity key={emoji} onPress={() => handleReact(emoji, msgId)} className="mx-1.5"><Text style={{ fontSize: 26 }}>{emoji}</Text></TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }

    // 👉 RENDER TEXT & IMAGE
    return (
      <View className={`w-full ${showName ? 'mt-3' : 'mt-0.5'} ${isMe ? 'items-end' : 'items-start'}`}>
        
        {showName && <Text className="text-[11px] font-medium text-gray-500 mb-1 ml-14">{senderName}</Text>}

        <View className={`flex-row px-4 ${isMe ? 'justify-end' : 'justify-start'} w-full ${hasReactions ? 'mb-4' : ''}`}>
          {!isMe && (
            <View className="w-8 mr-2 justify-end">
              {showAvatar ? <Image source={{ uri: senderAvatar }} className="w-8 h-8 rounded-full mb-1" /> : null}
            </View>
          )}

          <TouchableOpacity 
            activeOpacity={0.8}
            onLongPress={() => { if (!isSending) setSelectedMessageId(isSelected ? null : msgId); }}
            className={`relative ${isImage ? 'p-1' : 'px-4 py-2.5'} rounded-2xl ${isMe ? 'bg-[#2B8EF0]' : 'bg-gray-100'}`}
            style={{ opacity: isSending ? 0.7 : 1, maxWidth: isMe ? '75%' : '80%' }} 
          >
            {!isImage && <Text className={`text-[15px] leading-5 ${isMe ? 'text-white' : 'text-gray-900'}`}>{item.content || item.message}</Text>}
            
            {/* Sử dụng getCdnUrl để nén ảnh thumbnail trên khung chat (tối ưu list) */}
            {isImage && item.metadata?.url && (
              <Image 
                source={{ uri: getCdnUrl(item.metadata.url, 'w_400,c_limit,q_auto') }} 
                style={{ width: 200, height: 250, borderRadius: 12, backgroundColor: '#f3f4f6' }} 
                resizeMode="cover" 
              />
            )}
            
            {(!nextMsg || nextMsg.sender_id !== item.sender_id) && (
              <Text className={`text-[10px] mt-1 ${isMe ? 'text-primary-soft text-right' : 'text-gray-400 text-left'}`}>{timeString} {isSending ? '...' : ''}</Text>
            )}

            {hasReactions && (
              <View className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} bg-white px-1.5 py-[2px] rounded-full border border-gray-100 flex-row items-center shadow-sm`}>
                {uniqueEmojis.map((emoji, idx) => <Text key={idx} style={{ fontSize: 11 }}>{emoji}</Text>)}
                {item.reactions.length > 1 && <Text className="text-[10px] font-bold text-gray-500 ml-1">{item.reactions.length}</Text>}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {isSelected && (
          <View className={`flex-row bg-white rounded-full px-3 py-1.5 mt-2 z-10 shadow-sm border border-gray-50 ${isMe ? 'mr-4' : 'ml-14'}`}>
            {EMOJI_LIST.map((emoji) => (
              <TouchableOpacity key={emoji} onPress={() => handleReact(emoji, msgId)} className="mx-1.5"><Text style={{ fontSize: 26 }}>{emoji}</Text></TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#ffffff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled={Platform.OS === 'ios'}>
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white border-b border-gray-100 flex-row items-center justify-between px-2 pb-3 shadow-sm z-10">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={onBack} className="p-2">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg>
          </TouchableOpacity>
          <Text className="text-lg font-bold ml-2 text-gray-900" numberOfLines={1}>{chatName}</Text>
        </View>

        {onOpenSettings && (
          <TouchableOpacity onPress={onOpenSettings} className="p-2 mr-1">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#2B8EF0" strokeWidth="2"><Circle cx="12" cy="12" r="10" /><Path d="M12 16v-4" /><Path d="M12 8h.01" /></Svg>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Chat Area */}
      {loading ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#2B8EF0" /></View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => (item._id || item.id || index).toString()}
          renderItem={renderMessage}
          className="flex-1 py-4 bg-white"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 15 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setSelectedMessageId(null)}
        />
      )}

      {/* Bottom Input Area */}
      <View className="flex-row items-center px-3 py-3 bg-white border-t border-gray-100" style={{ paddingBottom: isKeyboardVisible ? 12 : safeBottom }}>
        
        {/* Nút Tools: Image & Poll */}
        <View className="flex-row mr-2 items-center">
          <TouchableOpacity onPress={handlePickImage} className="p-1.5 mr-1 rounded-full">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <Circle cx="8.5" cy="8.5" r="1.5"/>
              <Path d="M21 15l-5-5L5 21"/>
            </Svg>
          </TouchableOpacity>
          
          {isGroup && (
            <TouchableOpacity onPress={() => setIsCreatePollVisible(true)} className="p-1.5 rounded-full">
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M18 20V10"/><Path d="M12 20V4"/><Path d="M6 20v-6"/>
              </Svg>
            </TouchableOpacity>
          )}
        </View>

        {/* Input Text */}
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 min-h-[44px]">
          <TextInput value={inputText} onChangeText={setInputText} onFocus={() => setSelectedMessageId(null)} placeholder="Nhắn tin..." placeholderTextColor="#9CA3AF" className="flex-1 text-[16px] text-gray-900 py-2.5" multiline maxLength={500} />
        </View>

        <TouchableOpacity onPress={handleSend} disabled={!inputText.trim()} className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-[#2B8EF0]' : 'bg-gray-200'}`}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={inputText.trim() ? 'white' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </TouchableOpacity>
      </View>

      {/* 👉 MODAL TẠO POLL */}
      <Modal visible={isCreatePollVisible} transparent={true} animationType="slide" onRequestClose={() => setIsCreatePollVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity activeOpacity={1} onPress={() => Keyboard.dismiss()} className="flex-1 bg-black/40 justify-end">
            <View className="bg-white rounded-t-3xl pt-5 px-5" style={{ paddingBottom: safeBottom + 20, maxHeight: '85%' }}>
              
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">Tạo bình chọn</Text>
                <TouchableOpacity onPress={() => setIsCreatePollVisible(false)} className="p-1.5 bg-gray-100 rounded-full">
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><Line x1="18" y1="6" x2="6" y2="18"/><Line x1="6" y1="6" x2="18" y2="18"/></Svg>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Câu hỏi</Text>
                <TextInput value={pollQuestion} onChangeText={setPollQuestion} placeholder="Ví dụ: Tối nay ăn gì?" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[16px] text-gray-900 mb-5" />

                <Text className="text-sm font-semibold text-gray-700 mb-2">Lựa chọn</Text>
                {pollOptions.map((opt, index) => (
                  <View key={index} className="flex-row items-center bg-white border border-gray-200 rounded-xl mb-3 pr-2 overflow-hidden shadow-sm">
                    <TextInput value={opt} onChangeText={(txt) => handleUpdatePollOption(txt, index)} placeholder={`Lựa chọn ${index + 1}`} className="flex-1 py-3.5 px-4 text-[16px] text-gray-900" />
                    <TouchableOpacity onPress={() => handleRemovePollOption(index)} className="p-3">
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Svg>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity onPress={handleAddPollOption} className="flex-row items-center py-3 mb-6 mt-1">
                  <View className="w-8 h-8 rounded-full bg-primary-soft items-center justify-center mr-3">
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#2B8EF0" strokeWidth="2.5"><Line x1="12" y1="5" x2="12" y2="19"/><Line x1="5" y1="12" x2="19" y2="12"/></Svg>
                  </View>
                  <Text className="text-[#2B8EF0] font-bold text-[15px]">Thêm lựa chọn</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSendPoll} className="bg-[#2B8EF0] rounded-xl py-4 items-center shadow-sm">
                  <Text className="text-white font-bold text-[16px]">Gửi bình chọn</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Overlay Uploading */}
      {isUploading && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-2 font-bold text-base">Đang xử lý ảnh...</Text>
        </View>
      )}

    </KeyboardAvoidingView>
  );
};
