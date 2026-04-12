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
} from 'react-native';
import { X, Copy, RefreshCw, Clock } from 'lucide-react-native';
import { Button } from '../../../shared';
import { generateCheckInToken } from '../../../../utils/checkInTokenUtils';
import QRCode from 'react-native-qrcode-svg';

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
  const [remainingTime, setRemainingTime] = useState<string>('05:00');
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);
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
      const elapsedMs = Date.now() - generatedTime;
      const remainingMs = 300000 - elapsedMs; // 5 minutes

      if (remainingMs <= 0) {
        setToken(null);
        setRemainingTime('00:00');
        setIsExpiringSoon(true);
      } else {
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        
        // Cảnh báo đỏ nếu dưới 1 phút
        setIsExpiringSoon(minutes === 0);
        
        // Format MM:SS
        const formattedMins = minutes.toString().padStart(2, '0');
        const formattedSecs = seconds.toString().padStart(2, '0');
        setRemainingTime(`${formattedMins}:${formattedSecs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, token, generatedTime]);

  // Pulse animation for QR code
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    if (token) {
      animation.start();
    }
    return () => animation.reset();
  }, [token]);

  const generateToken = async () => {
    setIsGenerating(true);
    setIsExpiringSoon(false);
    try {
      const qrPayload = JSON.stringify({
        jId: journeyId,
        dId: dayId,
        sId: stopId,
        ts: Date.now() 
      });
      
      setToken(qrPayload);
      setGeneratedTime(Date.now());
      setRemainingTime('05:00');
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
      console.log('Token copied:', token);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Mã Check-in</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {stopName}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Đang tạo mã bảo mật...</Text>
              </View>
            ) : token ? (
              <View style={styles.qrContainer}>
                {/* Expiry Timer Badge */}
                <View style={[
                  styles.timerBadge, 
                  isExpiringSoon ? styles.timerBadgeDanger : styles.timerBadgeSafe
                ]}>
                  <Clock size={16} color={isExpiringSoon ? '#DC2626' : '#D97706'} />
                  <Text style={[
                    styles.timerText, 
                    isExpiringSoon ? styles.timerTextDanger : styles.timerTextSafe
                  ]}>
                    Hết hạn trong: {remainingTime}
                  </Text>
                </View>

                {/* Animated QR Code */}
                <Animated.View
                  style={[
                    styles.qrWrapper,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <QRCode
                    value={token}
                    size={190}
                    color="#111827"
                    backgroundColor="#fff"
                  />
                </Animated.View>

                {/* Minimal Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionText}>
                    Đưa mã này cho thành viên trong nhóm quét để xác nhận điểm danh.
                  </Text>
                </View>

                {/* Action Buttons (Side by Side) */}
                <View style={styles.buttonsRow}>
                  <Button
                    style={styles.copyBtn}
                    onPress={handleCopyToken}
                  >
                    <Copy size={18} color="#4B5563" />
                    <Text style={styles.copyBtnText}>Sao chép</Text>
                  </Button>

                  <Button
                    style={styles.regenerateBtn}
                    onPress={handleRegenerateToken}
                  >
                    <RefreshCw size={18} color="#fff" />
                    <Text style={styles.regenerateBtnText}>Làm mới mã</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Đã xảy ra lỗi hoặc mã đã hết hạn.</Text>
                <Button style={styles.regenerateBtn} onPress={generateToken}>
                  <RefreshCw size={18} color="#fff" />
                  <Text style={styles.regenerateBtnText}>Tạo mã mới</Text>
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
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Tối hơn một chút để focus vào Modal
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    maxWidth: 220,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
    gap: 6,
  },
  timerBadgeSafe: {
    backgroundColor: '#FEF3C7',
  },
  timerBadgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timerTextSafe: {
    color: '#D97706',
  },
  timerTextDanger: {
    color: '#DC2626',
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginBottom: 24,
  },
  instructionsContainer: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  instructionText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  copyBtnText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 15,
  },
  regenerateBtn: {
    flex: 1.2,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  regenerateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    marginBottom: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});