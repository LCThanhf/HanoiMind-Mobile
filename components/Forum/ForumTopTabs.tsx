// src/components/forum/ForumTopTabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  const categories: ForumCategory[] = [
    ForumCategory.REVIEW,
    ForumCategory.EXPERIENCE,
    ForumCategory.FIND_BUDDY,
  ];

  return (
    <View className="bg-white border-b border-gray-100 px-4 py-3">
      <View className="flex-row items-center">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity 
              key={cat} 
              onPress={() => onCategoryChange(cat)}
              className={`flex-1 items-center pb-1 ${isActive ? 'border-b-2 border-primary' : 'border-b-2 border-transparent'}`}
            >
              <Text className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
