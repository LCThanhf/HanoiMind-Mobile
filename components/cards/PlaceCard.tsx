import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Place } from '../../services/placeService/place.type';
import { Button, StarRating, PillBadge, CardContainer } from '../shared';

interface PlaceCardProps {
  place: Place;
  layout?: 'vertical' | 'horizontal';
  onPress?: (placeId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const PlaceCard = ({ place, layout = 'vertical', onPress, style }: PlaceCardProps) => {
  const imageUrl = place.images?.[0] || 'https://via.placeholder.com/400';
  const rating = place.rating || 0;
  const reviewCount = place.reviewCount || 0;

  if (layout === 'horizontal') {
    return (
      <Button onPress={() => onPress?.(place._id)} style={[styles.cardPress, style]} activeOpacity={0.8}>
        <CardContainer style={styles.cardContainerHorizontal}>
          <Image source={{ uri: imageUrl }} style={styles.imageHorizontal} />
          <View style={styles.contentHorizontal}>
            <Text style={styles.nameHorizontal} numberOfLines={1}>{place.name}</Text>
            <Text style={styles.infoText}>
              {place.distance ? `${(place.distance / 1000).toFixed(1)} km` : 'N/A'} • {reviewCount} đánh giá
            </Text>
            <PillBadge
              label={`Độ đông đúc: ${place.crowdLevel || 1}/5`}
              backgroundColor="#FEF3C7"
              textColor="#D97706"
              textSize={10}
              textWeight="700"
              containerStyle={styles.crowdBadge}
            />
          </View>
        </CardContainer>
      </Button>
    );
  }

  return (
    <Button
      style={[styles.cardVertical, style]}
      activeOpacity={0.85}
      onPress={() => onPress?.(place._id)}
    >
      <Image source={{ uri: imageUrl }} style={styles.imageVertical} />
      <View style={styles.contentVertical}>
        <Text style={styles.nameVertical} numberOfLines={1}>{place.name}</Text>
        <StarRating rating={rating} />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#6B7280" />
            </Svg>
            <Text style={styles.statText}>{place.distance ? `${(place.distance / 1000).toFixed(1)} km` : 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
              <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#6B7280" />
            </Svg>
            <Text style={styles.statText}>{place.crowdLevel || 1}/5</Text>
          </View>
        </View>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  cardPress: {
    marginBottom: 12,
  },
  cardContainerHorizontal: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageHorizontal: {
    width: 100,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  contentHorizontal: {
    flex: 1,
  },
  nameHorizontal: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  crowdBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardVertical: {
    width: 160,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6', // gray-100
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageVertical: {
    width: '100%',
    height: 100,
    backgroundColor: '#E5E7EB',
  },
  contentVertical: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  nameVertical: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
  }
});
