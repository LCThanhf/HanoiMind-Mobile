import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { X } from 'lucide-react-native';

interface MemberScannerModalProps {
  visible: boolean;
  currentJourneyId: string;
  currentStopId: string;
  onClose: () => void;
  onScanSuccess: () => void;
}

export const MemberScannerModal: React.FC<MemberScannerModalProps> = ({
  visible,
  currentJourneyId,
  currentStopId,
  onClose,
  onScanSuccess,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // 1. Giải mã nội dung QR
      // Nếu ở bước 1 bạn dùng btoa, thì ở đây dùng atob(data)
      const parsedData = JSON.parse(data);

      // 2. Kiểm tra tính hợp lệ của trạm
      if (parsedData.jId !== currentJourneyId || parsedData.sId !== currentStopId) {
        Alert.alert('Mã không hợp lệ', 'Mã QR này không dành cho địa điểm hiện tại.', [
          { text: 'Quét lại', onPress: () => setScanned(false) }
        ]);
        return;
      }

      // 3. Kiểm tra hạn sử dụng (5 phút = 300,000 milliseconds)
      const timeElapsed = Date.now() - parsedData.ts;
      if (timeElapsed > 300000) {
        Alert.alert('Mã đã hết hạn', 'Mã QR này đã quá 5 phút. Hãy yêu cầu Trưởng nhóm mở mã mới.', [
          { text: 'Đóng', onPress: onClose }
        ]);
        return;
      }

      // 4. Mọi thứ hợp lệ -> Gọi hàm Success
      onScanSuccess();
      
    } catch (error) {
      Alert.alert('Lỗi đọc mã', 'Đây không phải là mã QR Check-in hợp lệ của hệ thống.', [
        { text: 'Quét lại', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    Alert.alert('Lỗi quyền truy cập', 'Bạn cần cấp quyền Camera để quét mã QR.');
    onClose();
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quét mã QR Trưởng nhóm</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        {/* Khung ngắm mô phỏng (UI) */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.instruction}>Đưa mã QR vào trong khung hình</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  scanFrame: {
    width: 250, height: 250, borderWidth: 2, borderColor: '#3B82F6',
    backgroundColor: 'transparent',
  },
  instruction: {
    color: '#fff', marginTop: 20, fontSize: 14, backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  }
});