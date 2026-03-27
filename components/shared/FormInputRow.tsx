import React from 'react';
import { TextInput, View, Text, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from 'react-native';

interface FormInputRowProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  marginBottom?: number;
}

export const FormInputRow = ({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightSlot,
  containerStyle,
  inputContainerStyle,
  marginBottom = 16,
}: FormInputRowProps) => {
  return (
    <View style={[{ marginBottom }, containerStyle]}>
      {label ? (
        <Text style={{ color: '#111827', fontSize: 15, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
      ) : null}

      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            backgroundColor: '#F9FAFB',
            paddingHorizontal: 16,
          },
          inputContainerStyle,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={editable}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 15, color: '#111827' }}
        />
        {rightSlot ? rightSlot : null}
      </View>
    </View>
  );
};
