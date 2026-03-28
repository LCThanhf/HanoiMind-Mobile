import React from 'react';
import { View, Text } from 'react-native';
import { AvatarCircle } from './AvatarCircle';

interface AvatarStackItem {
  uri?: string;
  name?: string;
}

interface AvatarStackProps {
  items: AvatarStackItem[];
  size?: number;
  overlap?: number;
  maxVisible?: number;
  showCounter?: boolean;
  counterBackgroundColor?: string;
  counterTextColor?: string;
}

export const AvatarStack = ({
  items,
  size = 28,
  overlap = 8,
  maxVisible = 3,
  showCounter = true,
  counterBackgroundColor = '#F3F4F6',
  counterTextColor = '#374151',
}: AvatarStackProps) => {
  const visible = items.slice(0, maxVisible);
  const extraCount = Math.max(0, items.length - maxVisible);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((item, index) => (
        <View
          key={`${item.uri || item.name || 'avatar'}-${index}`}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: 'white',
            overflow: 'hidden',
            marginLeft: index === 0 ? 0 : -overlap,
            zIndex: visible.length - index,
          }}
        >
          <AvatarCircle uri={item.uri} name={item.name} size={size} backgroundColor="#D1D5DB" />
        </View>
      ))}

      {showCounter && extraCount > 0 ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: 'white',
            backgroundColor: counterBackgroundColor,
            marginLeft: visible.length > 0 ? -overlap : 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: counterTextColor }}>{`+${extraCount}`}</Text>
        </View>
      ) : null}
    </View>
  );
};
