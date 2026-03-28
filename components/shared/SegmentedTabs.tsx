import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface SegmentedTabItem<T extends string> {
  key: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  items: SegmentedTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  containerClassName?: string;
  activeBorderColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

export function SegmentedTabs<T extends string>({
  items,
  activeKey,
  onChange,
  containerClassName,
  activeBorderColor = '#2B8EF0',
  activeTextColor = '#2B8EF0',
  inactiveTextColor = '#9CA3AF',
}: SegmentedTabsProps<T>) {
  return (
    <View className={containerClassName ?? 'flex-row items-center'}>
      {items.map((item) => {
        const isActive = activeKey === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onChange(item.key)}
            className="flex-1 items-center pb-1 border-b-2"
            style={{ borderBottomColor: isActive ? activeBorderColor : 'transparent' }}
          >
            <Text className="font-bold text-sm" style={{ color: isActive ? activeTextColor : inactiveTextColor }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
