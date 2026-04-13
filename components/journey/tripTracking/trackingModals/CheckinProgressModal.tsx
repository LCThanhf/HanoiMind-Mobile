import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, CheckCircle, Clock, User } from 'lucide-react-native';
import { Button } from '../../../shared';

interface CheckInMember {
  user_id?: string;
  user_name?: string;
  user_avatar?: string;
  check_in_time?: string;
  [key: string]: any;
}

interface CheckInStatusData {
  progress_percentage: number;
  check_in_list: CheckInMember[];
  pending_list: CheckInMember[];
}

interface CheckInProgressModalProps {
  visible: boolean;
  data: CheckInStatusData | null;
  onClose: () => void;
}

export const CheckInProgressModal: React.FC<CheckInProgressModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  if (!data) return null;

  const totalMembers = data.check_in_list.length + data.pending_list.length;
  const checkedInCount = data.check_in_list.length;

  const renderMember = (member: CheckInMember, isCheckedIn: boolean) => {
    // Trích xuất tên (ưu tiên fullName, sau đó đến user_name, name)
    const name = member.fullName || member.user_name || member.name || member.user?.fullName || member.user?.name || 'Thành viên';
    
    // Trích xuất avatar
    const avatar = member.avatar || member.user_avatar || member.user?.avatar || member.user?.user_avatar;
    
    // Trích xuất thời gian
    const time = member.check_in_time || member.checkInTime || member.time;
    
    // Tạo key an toàn
    const keyId = member.id || member.user_id || member._id || Math.random().toString();

    return (
      <View key={keyId} style={styles.memberRow}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#9CA3AF' }}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{name}</Text>
          <Text style={styles.memberTime}>
            {isCheckedIn ? `Đã điểm danh${time ? `: ${time}` : ''}` : 'Chưa điểm danh'}
          </Text>
        </View>
        {isCheckedIn ? (
          <CheckCircle size={20} color="#10B981" />
        ) : (
          <Clock size={20} color="#F59E0B" />
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Tiến độ điểm danh</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Đã check-in: {checkedInCount} / {totalMembers}
            </Text>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${data.progress_percentage || 0}%` }
                ]} 
              />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
            {data.check_in_list.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đã hoàn thành</Text>
                {data.check_in_list.map(m => renderMember(m, true))}
              </View>
            )}

            {data.pending_list.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đang chờ</Text>
                {data.pending_list.map(m => renderMember(m, false))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Đóng</Text>
            </Button>
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
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
  progressContainer: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  memberTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doneBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
});