// src/components/forum/ForumTopTabs.tsx
import React from 'react';
import { View } from 'react-native';
import { SegmentedTabs, type SegmentedTabItem } from '../shared';
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
  const categories: SegmentedTabItem<ForumCategory>[] = [
    { key: ForumCategory.REVIEW, label: CATEGORY_LABELS[ForumCategory.REVIEW] },
    { key: ForumCategory.EXPERIENCE, label: CATEGORY_LABELS[ForumCategory.EXPERIENCE] },
    { key: ForumCategory.FIND_BUDDY, label: CATEGORY_LABELS[ForumCategory.FIND_BUDDY] },
  ];

  return (
    <View className="bg-white border-b border-gray-100 px-4 py-3">
      <SegmentedTabs items={categories} activeKey={activeCategory} onChange={onCategoryChange} />
    </View>
  );
};
