import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { processImage, upImageToCloudinary } from '../../../utils/uploadImage';
import { Button } from '../../shared';

interface MediaUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelected: (imageUrl: string) => void;
  selectedImages?: string[];
  maxImages?: number;
}

export const MediaUploadModal = ({
  visible,
  onClose,
  onMediaSelected,
  selectedImages = [],
  maxImages = 5,
}: MediaUploadModalProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Bạn cần cho phép truy cập thư viện ảnh!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        setIsUploading(true);
        try {
          const processedUri = await processImage(result.assets[0].uri);
          const cloudUrl = await upImageToCloudinary(processedUri);

          if (cloudUrl) {
            onMediaSelected(cloudUrl);
            alert('Upload thành công!');
          } else {
            alert('Upload thất bại. Vui lòng thử lại!');
          }
        } catch (err) {
          console.error('Lỗi upload:', err);
          alert('Lỗi khi upload ảnh!');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Lỗi chọn ảnh:', error);
    }
  };

  const isFull = selectedImages.length >= maxImages;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 30,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-bold text-gray-900">Thêm ảnh</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Upload Area */}
          <Button
            onPress={handlePickImage}
            disabled={isFull || isUploading}
            className={`rounded-3xl border-2 border-dashed py-8 items-center justify-center ${
              isFull ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-primary'
            }`}
          >
            {isUploading ? (
              <ActivityIndicator size="large" color="#2B8EF0" />
            ) : (
              <>
                <ImagePlus size={32} color={isFull ? '#D1D5DB' : '#2B8EF0'} />
                <Text className={`mt-3 font-semibold ${isFull ? 'text-gray-400' : 'text-gray-900'}`}>
                  {isFull ? `Đã đủ ${maxImages} ảnh` : 'Chọn từ thư viện'}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Tối đa {maxImages} ảnh</Text>
              </>
            )}
          </Button>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <View className="mt-6">
              <Text className="text-sm font-semibold text-gray-900 mb-3">Ảnh đã chọn ({selectedImages.length})</Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedImages.map((image, idx) => (
                  <View
                    key={idx}
                    className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden relative"
                  >
                    <Image source={{ uri: image }} className="w-full h-full" />
                    <TouchableOpacity
                      onPress={() => {}}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                    >
                      <X size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Button
            label="Xong"
            onPress={onClose}
            className="mt-6 bg-primary"
            style={{ borderRadius: 14, minHeight: 48 }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};
