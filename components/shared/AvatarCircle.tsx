import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarCircleProps {
  uri?: string;
  name?: string;
  size?: number;
  backgroundColor?: string;
}

const initialsFromName = (name?: string) => {
  if (!name) return 'U';
  const words = name.trim().split(' ').filter(Boolean);
  if (!words.length) return 'U';
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0].slice(0, 1)}${words[words.length - 1].slice(0, 1)}`.toUpperCase();
};

export const AvatarCircle = ({
  uri,
  name,
  size = 36,
  backgroundColor = '#C4856A',
}: AvatarCircleProps) => {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: 'white', fontWeight: '700', fontSize: Math.max(12, size * 0.34) }}>
        {initialsFromName(name)}
      </Text>
    </View>
  );
};
