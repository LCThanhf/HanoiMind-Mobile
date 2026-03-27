import React from 'react';
import { TextInput, View, TouchableOpacity, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { SearchIcon } from './Icons';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  placeholderTextColor?: string;
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  showClearButton?: boolean;
  onClear?: () => void;
  height?: number;
}

export const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm...',
  onSubmitEditing,
  placeholderTextColor = '#9CA3AF',
  rightSlot,
  containerStyle,
  inputStyle,
  showClearButton = false,
  onClear,
  height = 46,
}: SearchInputProps) => {
  return (
    <View
      style={[
        {
          height,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: 'white',
          borderRadius: 12,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
        },
        containerStyle,
      ]}
    >
      <SearchIcon />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        onSubmitEditing={onSubmitEditing}
        style={[{ flex: 1, fontSize: 14, color: '#111827', marginLeft: 8 }, inputStyle]}
      />

      {showClearButton && value ? (
        <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
          <SearchIcon size={14} color="#9CA3AF" />
        </TouchableOpacity>
      ) : null}

      {rightSlot ? rightSlot : null}
    </View>
  );
};
