import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Button } from './Button';

interface LocationPermissionPopupProps {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimaryPress: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  primaryLoading?: boolean;
}

export const LocationPermissionPopup: React.FC<LocationPermissionPopupProps> = ({
  visible,
  title,
  message,
  primaryLabel = 'Thử lại',
  onPrimaryPress,
  onOpenSettings,
  onClose,
  primaryLoading = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(event) => event.stopPropagation()}>
          <View style={styles.iconWrapper}>
            <MapPin size={20} color="#2B8EF0" />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Button
              label={primaryLabel}
              onPress={onPrimaryPress}
              loading={primaryLoading}
              size="md"
            />
            <Button
              label="Mở cài đặt"
              onPress={onOpenSettings}
              variant="secondary"
              size="md"
            />
            <Button
              label="Đóng"
              onPress={onClose}
              variant="link"
              size="sm"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
});
