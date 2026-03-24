// src/components/forum/ForumTopTabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ForumCategory } from '../../services/forumService/forum.type';

// Tạo một mapping để hiển thị tên Tiếng Việt cho đẹp
const CATEGORY_LABELS: Record<ForumCategory, string> = {
  [ForumCategory.REVIEW]: 'Review',
  [ForumCategory.EXPERIENCE]: 'Kinh nghiệm',
  [ForumCategory.FIND_BUDDY]: 'Tìm bạn',
  [ForumCategory.QNA]: 'Hỏi đáp',
  [ForumCategory.OTHERS]: 'Khác',
};

interface Props {
  activeCategory: ForumCategory;
  onCategoryChange: (category: ForumCategory) => void;
}

export const ForumTopTabs: React.FC<Props> = ({ activeCategory, onCategoryChange }) => {
  // Lấy danh sách các keys từ Enum
  const categories = Object.values(ForumCategory);

  return (
    <View className="bg-white border-b border-gray-100">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity 
              key={cat} 
              onPress={() => onCategoryChange(cat)}
              className={`mr-6 pb-1 ${isActive ? 'border-b-2 border-green-500' : ''}`}
            >
              <Text className={`font-bold text-sm ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};