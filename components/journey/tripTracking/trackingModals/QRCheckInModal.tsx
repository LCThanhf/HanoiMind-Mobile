/**
 * QR Code Check-in Modal for Host
 * Displays a QR code that members can scan to perform check-in
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Copy, RefreshCw } from 'lucide-react-native';
import { Button } from '../../../shared';
import { generateCheckInToken, formatRemainingTime, getTokenRemainingTime } from '../../../../utils/checkInTokenUtils';

interface QRCheckInModalProps {
  visible: boolean;
  journeyId: string;
  dayId: string;
  stopId: string;
  userId: string; // Host ID
  stopName: string;
  onClose: () => void;
  onTokenGenerated?: (token: string) => void;
}

export const QRCheckInModal: React.FC<QRCheckInModalProps> = ({
  visible,
  journeyId,
  dayId,
  stopId,
  userId,
  stopName,
  onClose,
  onTokenGenerated,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>('5m 0s');
  const [generatedTime, setGeneratedTime] = useState<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate token when modal opens
  useEffect(() => {
    if (visible && !token) {
      generateToken();
    }
  }, [visible]);

  // Update remaining time every second
  useEffect(() => {
    if (!visible || !token || generatedTime === 0) return;

    const interval = setInterval(() => {
      const remaining = getTokenRemainingTime(generatedTime, 300); // 5 minutes validity
      if (remaining <= 0) {
        setToken(null);
      } else {
        setRemainingTime(formatRemainingTime(remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, token, generatedTime]);

  // Pulse animation for QR code
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.reset();
  }, []);

const generateToken = async () => {
    setIsGenerating(true);
    try {
      // Ép thông tin thành chuỗi JSON làm nội dung cho mã QR
      const qrPayload = JSON.stringify({
        jId: journeyId,
        dId: dayId,
        sId: stopId,
        ts: Date.now() // Lưu thời gian tạo để Frontend của member check hạn sử dụng
      });
      
      // Chuyển sang base64 để chuỗi gọn gàng hơn (Tùy chọn)
      // const encodedToken = btoa(qrPayload); 
      
      setToken(qrPayload); // Hoặc setToken(encodedToken)
      setGeneratedTime(Date.now());
      setRemainingTime('5m 0s');
      onTokenGenerated?.(qrPayload);
    } catch (error) {
      console.error('[QRCheckInModal] Error generating token:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setToken(null);
    setGeneratedTime(0);
    onClose();
  };

  const handleRegenerateToken = async () => {
    setToken(null);
    await generateToken();
  };

  const handleCopyToken = () => {
    if (token) {
      // In a real app, you'd use react-native-clipboard or similar
      console.log('Token copied:', token);
      // Toast message could be shown here
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Mã QR Check-in</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>Điểm đến: {stopName}</Text>

            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
              </View>
            ) : token ? (
              <View style={styles.qrContainer}>
                {/* QR Code Placeholder - Replace with actual QR code library if needed */}
                <Animated.View
                  style={[
                    styles.qrPlaceholder,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <View style={styles.qrGrid}>
                    {/* Simple placeholder - In production, use a QR generate library */}
                    <Text style={styles.qrPlaceholderText}>QR</Text>
                    <Text style={styles.tokenText}>{token.substring(0, 20)}...</Text>
                  </View>
                </Animated.View>

                {/* Expiry Timer */}
                <View style={styles.timerContainer}>
                  <Text style={styles.timerLabel}>Mã hết hạn trong</Text>
                  <Text style={styles.timerValue}>{remainingTime}</Text>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionTitle}>Hướng dẫn:</Text>
                  <Text style={styles.instructionText}>
                    • Chia sẻ mã QR này với thành viên{'\n'}
                    • Thành viên quét mã bằng ứng dụng{'\n'}
                    • Tự động ghi nhận check-in
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                  <Button
                    style={styles.copyBtn}
                    onPress={handleCopyToken}
                  >
                    <Copy size={18} color="#3B82F6" />
                    <Text style={styles.copyBtnText}>Sao chép mã</Text>
                  </Button>

                  <Button
                    style={styles.regenerateBtn}
                    onPress={handleRegenerateToken}
                  >
                    <RefreshCw size={18} color="#fff" />
                    <Text style={styles.regenerateBtnText}>Tạo lại mã</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Không thể tạo mã QR</Text>
                <Button style={styles.retryBtn} onPress={generateToken}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Thử lại</Text>
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  qrGrid: {
    alignItems: 'center',
  },
  qrPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  timerLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
  },
  instructionsContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  buttonsContainer: {
    gap: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  copyBtnText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  regenerateBtn: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  regenerateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
