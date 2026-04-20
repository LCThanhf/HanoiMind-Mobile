import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';

export interface Category {
  id: string;
  label: string;
}

interface CategorySelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  selectedCategory?: Category;
  categories: Category[];
}

const DEFAULT_CATEGORIES: Category[] = [
          { id: 'review', label: '⭐ Review ' },
          { id: 'experience', label: '💡 Mẹo & Kinh nghiệm' },
          { id: 'find_buddy', label: '📖 Tìm bạn đồng hành' },
          { id: 'qna', label: '❓ Hỏi & Tìm tư vấn' },
          { id: 'others', label: '💦 Khác' },
];

export const CategorySelectModal = ({
  visible,
  onClose,
  onSelect,
  selectedCategory,
  categories = DEFAULT_CATEGORIES,
}: CategorySelectModalProps) => {
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
            maxHeight: '70%',
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-bold text-gray-900">Chọn danh mục</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Categories List */}
          <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
            {categories.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => {
                    onSelect(category);
                    onClose();
                  }}
                  className={`flex-row items-center p-4 rounded-2xl mb-2 border ${
                    isSelected ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {category.label}
                    </Text>
                  </View>
                  {isSelected && <Check size={20} color="#2B8EF0" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
