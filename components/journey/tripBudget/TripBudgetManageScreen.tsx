import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Button, CardContainer, ScreenHeader } from '../../shared';
import { StopCostCard } from '../../tripBudget/StopCostCard';
import { MemberProfile, StopCostItem } from '../../tripBudget/types';
import { formatDateRange, useTripBudgetData } from '../../tripBudget/useTripBudgetData';

export type { MemberProfile, StopCostItem };

interface TripBudgetManageScreenProps {
  tripId: string;
  onBack: () => void;
  onUpdateStop: (stop: StopCostItem, members: MemberProfile[], perStopEstimated: number) => void;
}

export const TripBudgetManageScreen = ({ tripId, onBack, onUpdateStop }: TripBudgetManageScreenProps) => {
  const insets = useSafeAreaInsets();
  const {
    isLoading,
    loadError,
    journey,
    stops,
    members,
    perStopEstimated,
    filteredStops,
    dayNumbers,
    selectedDay,
    setSelectedDay,
    showDayDropdown,
    setShowDayDropdown,
    selectedDayLabel,
    reload,
  } = useTripBudgetData(tripId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
      {/* Header */}
      <ScreenHeader title="Quản lý chi phí" onBack={onBack} showBorder />

      {/* Trip sub-header */}
      {journey && (
        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text
                style={{ fontSize: 16, color: '#111827', fontWeight: '700' }}
                numberOfLines={1}
              >
                {journey.name}
              </Text>
              <Text
                style={{ fontSize: 12, color: '#6B7280', marginTop: 3, fontWeight: '400' }}
              >
                {formatDateRange(journey.start_date, journey.end_date)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 10,
                  color: '#6B7280',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                Tổng điểm dừng
              </Text>
              <Text style={{ fontSize: 18, color: '#2B8EF0', fontWeight: '700' }}>
                {stops.length} điểm
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Body */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2B8EF0" />
        </View>
      ) : loadError ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: '#EF4444',
              fontWeight: '500',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {loadError}
          </Text>
          <Button label="Thử lại" onPress={reload} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => setShowDayDropdown(false)}
          >
            {/* Section header + day filter */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 14,
              }}
            >
              <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>
                Chi tiết điểm dừng
              </Text>

              {/* Day dropdown */}
              <View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowDayDropdown((prev) => !prev);
                  }}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white',
                    minWidth: 130,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#374151',
                      fontWeight: '600',
                      marginRight: 5,
                    }}
                  >
                    {selectedDayLabel}
                  </Text>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 9l6 6 6-6"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>

                {showDayDropdown && (
                  <View
                    style={{
                      position: 'absolute',
                      top: '105%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      shadowColor: '#0F172A',
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 8,
                      zIndex: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDay(null);
                        setShowDayDropdown(false);
                      }}
                      style={{ paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View style={{ width: 18, marginRight: 6, alignItems: 'center' }}>
                        {selectedDay === null && (
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M5 13l4 4L19 7"
                              stroke="#2B8EF0"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: selectedDay === null ? '#2B8EF0' : '#374151',
                          fontWeight: selectedDay === null ? '700' : '500',
                        }}
                      >
                        Tất cả ngày
                      </Text>
                    </TouchableOpacity>

                    {dayNumbers.map((day) => (
                      <TouchableOpacity
                        key={day}
                        onPress={() => {
                          setSelectedDay(day);
                          setShowDayDropdown(false);
                        }}
                        style={{ paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center' }}
                      >
                        <View style={{ width: 18, marginRight: 6, alignItems: 'center' }}>
                          {selectedDay === day && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M5 13l4 4L19 7"
                                stroke="#2B8EF0"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 13,
                            color: selectedDay === day ? '#2B8EF0' : '#374151',
                            fontWeight: selectedDay === day ? '700' : '500',
                          }}
                        >
                          Ngày {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Stop cards */}
            <View style={{ paddingHorizontal: 20 }}>
              {filteredStops.length === 0 ? (
                <CardContainer style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '500' }}>
                    Không có điểm dừng nào.
                  </Text>
                </CardContainer>
              ) : (
                filteredStops.map((stop) => (
                  <StopCostCard
                    key={stop.stopId}
                    stop={stop}
                    onUpdatePress={() => onUpdateStop(stop, members, perStopEstimated)}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};
