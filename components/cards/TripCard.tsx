import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Journey } from '../../services/journeyService/journey.type';
import { Button } from '../shared';

const DAY_MS = 24 * 60 * 60 * 1000;

const VIETNAMESE_MOOD_MAP: Record<string, string> = {
  CHILL: 'Chill',
  RELAX: 'Thư giãn',
  NATURE: 'Lãng mạn',
  FOODIE: 'Ẩm thực',
  ADVENTURE: 'Phiêu lưu',
  CULTURE: 'Văn hóa',
  CITY: 'Năng động',
  BEACH: 'Biển',
  MOUNTAIN: 'Núi',
  FAMILY: 'Gia đình',
  COUPLE: 'Cặp đôi',
  HISTORICAL: 'Lịch sử',
};

const DEFAULT_TRIP_IMAGE = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=500&q=80';

export const getTripDuration = (journey: Journey) => {
  const start = new Date(journey.start_date).getTime();
  const end = new Date(journey.end_date).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return `${journey.days?.length || 0} ngày`;
  }
  return `${Math.max(1, Math.round((end - start) / DAY_MS) + 1)} ngày`;
};

export const getStatusBadge = (journey: Journey): { label: string; bg: string; text: string } => {
  const now = Date.now();
  const start = new Date(journey.start_date).getTime();
  const end = new Date(journey.end_date).getTime();
  if (!Number.isNaN(end) && end < now) return { label: 'Hoàn thành', bg: '#D1FAE5', text: '#16A34A' };
  if (!Number.isNaN(start) && start <= now) return { label: 'Đang diễn ra', bg: '#FEF3C7', text: '#D97706' };
  const daysLeft = Math.ceil((start - now) / DAY_MS);
  return { label: `Còn ${daysLeft} ngày`, bg: '#EFF6FF', text: '#3B82F6' };
};

export const getMoodLabel = (journey: Journey): string => {
  const firstTag = journey.tags?.[0];
  if (!firstTag) return 'Chuyến đi mới';
  return VIETNAMESE_MOOD_MAP[firstTag] || firstTag;
};

export const getLocationLabel = (journey: Journey): string => {
  const tripName = (journey.name || '').trim();
  const firstPart = tripName.split('-')[0]?.trim();
  if (firstPart) return firstPart;
  return 'Việt Nam';
};

export const isSoloTrip = (journey: Journey): boolean => {
  const memberCount = journey.members?.length ?? 0;
  const plannedCount = journey.planned_members_count ?? 0;
  const maxCount = Math.max(memberCount, plannedCount);
  return maxCount <= 1;
};

interface TripCardProps {
  trip: Journey;
  onPress?: (tripId: string) => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'detailed' | 'compact';
}

export const TripCard = ({ trip, onPress, style, variant = 'detailed' }: TripCardProps) => {
  const statusBadge = getStatusBadge(trip);
  const tripMode = isSoloTrip(trip) ? 'Solo' : 'Nhóm';
  const membersCount = Math.max(trip.members?.length ?? 0, trip.planned_members_count ?? 0, 1);

  if (variant === 'compact') {
    // Used in HomeScreen
    return (
      <Button
        key={trip._id}
        style={[styles.containerCompact, style]}
        activeOpacity={0.88}
        onPress={() => onPress?.(trip._id)}
      >
        <View style={styles.imageContainerCompact}>
          <Image source={{ uri: trip.avatar || DEFAULT_TRIP_IMAGE }} style={styles.image} />
          <View style={styles.badgeCompact}>
            <Text style={styles.badgeTextCompact}>{trip.visibility || 'Tùy chọn'}</Text>
          </View>
        </View>
        <View style={styles.contentCompact}>
          <View style={styles.rowBetween}>
            <Text style={styles.titleCompact} numberOfLines={2}>{trip.name}</Text>
            <Button>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="5" cy="12" r="1.5" fill="#9CA3AF" />
                <Circle cx="12" cy="12" r="1.5" fill="#9CA3AF" />
                <Circle cx="19" cy="12" r="1.5" fill="#9CA3AF" />
              </Svg>
            </Button>
          </View>
          <View>
            <View style={styles.rowCenter}>
              <View style={styles.iconOval}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" fill="#3B82F6" />
                </Svg>
              </View>
              <Text style={styles.textGray}>{getLocationLabel(trip)}</Text>
            </View>
            <View style={[styles.rowCenter, { marginTop: 4 }]}>
              <View style={styles.iconOval}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <Path d="M16 2v4M8 2v4M3 10h18" />
                </Svg>
              </View>
              <Text style={styles.textGray}>
                {getTripDuration(trip)} • {membersCount} người
              </Text>
            </View>
          </View>
        </View>
      </Button>
    );
  }

  // Used in TripsScreen (detailed variant)
  return (
    <Button
      key={trip._id}
      activeOpacity={0.88}
      onPress={() => onPress?.(trip._id)}
      style={[styles.containerDetailed, style]}
    >
      <View style={styles.imageContainerDetailed}>
        <Image source={{ uri: trip.avatar || DEFAULT_TRIP_IMAGE }} style={styles.image} />
        <View style={styles.badgeDetailed}>
          <Text style={styles.badgeTextDetailed}>{tripMode}</Text>
        </View>
      </View>

      <View style={styles.contentDetailed}>
        <View>
          <View style={[styles.rowBetween, { gap: 10 }]}>
            <Text style={styles.titleDetailed} numberOfLines={2}>
              {trip.name}
            </Text>
            <Text style={styles.menuDots}>...</Text>
          </View>

          <View style={[styles.rowCenter, { marginTop: 4 }]}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" fill="#6B7280" />
            </Svg>
            <Text style={styles.textSmallDark}>
              {getLocationLabel(trip)}
            </Text>
          </View>
        </View>

        <View style={[styles.rowCenter, { marginTop: 6 }]}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#3B82F6" strokeWidth="1.8" />
            <Path d="M16 2v4M8 2v4M3 10h18" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" />
          </Svg>
          <Text style={styles.textMediumDark}>{getTripDuration(trip)}</Text>

          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 14 }}>
            <Path d="M12 21s-6.716-4.298-9-8.076C1.4 10.2 2.565 6.98 5.3 5.79c1.808-.789 3.635-.31 4.7.743.734.723 1.264.723 2 0 1.064-1.052 2.89-1.532 4.7-.743 2.735 1.19 3.9 4.409 2.3 7.133C18.716 16.702 12 21 12 21Z" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.textSmallDark2}>{getMoodLabel(trip)}</Text>
        </View>

        <View style={{ marginTop: 4 }}>
          <Text style={[styles.statusBadge, { color: statusBadge.text, backgroundColor: statusBadge.bg }]}>
            {statusBadge.label} • {membersCount} thành viên
          </Text>
        </View>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  iconOval: { width: 20, height: 20, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  textGray: { color: '#4B5563', fontSize: 12, fontWeight: '500' },
  textSmallDark: { fontSize: 12, color: '#374151' },
  textSmallDark2: { fontSize: 12, color: '#374151', marginLeft: 4 },
  textMediumDark: { fontSize: 12, color: '#111827', marginLeft: 4 },

  // Compact styles
  containerCompact: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageContainerCompact: { position: 'relative', width: 110, height: 110, borderRadius: 12, overflow: 'hidden' },
  badgeCompact: { position: 'absolute', top: 8, left: 8, backgroundColor: '#2B8EF0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeTextCompact: { color: 'white', fontSize: 10, fontWeight: '700' },
  contentCompact: { flex: 1, marginLeft: 12, paddingVertical: 4, justifyContent: 'space-between' },
  titleCompact: { color: '#111827', fontSize: 15, fontWeight: '700', flex: 1, paddingRight: 8 },

  // Detailed styles
  containerDetailed: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 9,
    marginBottom: 12,
    flexDirection: 'row',
  },
  imageContainerDetailed: { width: 92, height: 92, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  badgeDetailed: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: '#2B8EF0' },
  badgeTextDetailed: { color: 'white', fontSize: 10, fontWeight: '700' },
  contentDetailed: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  titleDetailed: { fontSize: 14, fontWeight: '800', color: '#111827', flex: 1 },
  menuDots: { color: '#9CA3AF', fontSize: 14, lineHeight: 16 },
  statusBadge: { fontSize: 10, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
});
