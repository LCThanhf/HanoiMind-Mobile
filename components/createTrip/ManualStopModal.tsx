import React from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, CardContainer, SelectableCard } from '../shared';
import { PlaceCard } from '../cards/PlaceCard';
import { Place } from '../../services/placeService/place.type';

interface ManualStopModalProps {
  visible: boolean;
  onClose: () => void;
  manualPlaceKeyword: string;
  onChangeKeyword: (val: string) => void;
  manualPlaceLoading: boolean;
  manualPlaceResults: Place[];
  selectedManualPlace: Place | null;
  onSelectManualPlace: (place: Place) => void;
  manualStopDayOptions: { dayIndex: number; date: string; label: string }[];
  manualStopDayIndex: number;
  onSelectDayIndex: (index: number, date: string) => void;
  manualStopStartTime: Date;
  manualStopEndTime: Date;
  onOpenStartTimePicker: () => void;
  onOpenEndTimePicker: () => void;
  onAddManualStop: () => void;
  insetsBottom: number;
  formatCurrencyVnd: (value?: number) => string;
  formatDateDisplay: (value: string) => string;
  formatDateToHHmm: (value: Date) => string;
}

export const ManualStopModal = ({
  visible,
  onClose,
  manualPlaceKeyword,
  onChangeKeyword,
  manualPlaceLoading,
  manualPlaceResults,
  selectedManualPlace,
  onSelectManualPlace,
  manualStopDayOptions,
  manualStopDayIndex,
  onSelectDayIndex,
  manualStopStartTime,
  manualStopEndTime,
  onOpenStartTimePicker,
  onOpenEndTimePicker,
  onAddManualStop,
  insetsBottom,
  formatCurrencyVnd,
  formatDateDisplay,
  formatDateToHHmm,
}: ManualStopModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor: 'rgba(17, 24, 39, 0.35)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            maxHeight: '85%',
            paddingBottom: Math.max(insetsBottom, 16),
          }}
        >
          <View className="px-5 pt-4 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Thêm stop thủ công</Text>
            <Text style={{ marginTop: 4, fontSize: 12, color: '#6B7280' }}>Chọn địa điểm rồi đặt ngày giờ cụ thể cho stop.</Text>
          </View>

          <ScrollView className="px-5 pt-4" keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: '600' }}>Tìm địa điểm</Text>
            <View
              className="rounded-xl px-4"
              style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', height: 48, justifyContent: 'center' }}
            >
              <TextInput
                value={manualPlaceKeyword}
                onChangeText={onChangeKeyword}
                placeholder="Nhập tên địa điểm"
                placeholderTextColor="#9CA3AF"
                style={{ color: '#111827', fontSize: 14, fontWeight: '500' }}
              />
            </View>

            {manualPlaceLoading ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#2B8EF0" />
              </View>
            ) : null}

            {manualPlaceResults.map((place) => {
              const isSelected = selectedManualPlace?._id === place._id;
              return (
                <View key={place._id} style={{ marginTop: 10 }}>
                  <PlaceCard
                    place={place}
                    layout="horizontal"
                    onPress={() => onSelectManualPlace(place)}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1.4,
                      borderColor: isSelected ? '#2B8EF0' : '#E5E7EB',
                      backgroundColor: isSelected ? '#EFF6FF' : 'white',
                    }}
                  />

                  <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CardContainer style={{ borderRadius: 999, borderColor: '#BBF7D0', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: '#166534', fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
                        {formatCurrencyVnd(place.estimated_cost_vnd)}
                      </Text>
                    </CardContainer>

                    {isSelected ? (
                      <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '700' }}>Đã chọn địa điểm này</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}

            <View className="mt-4" style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>Ngày và giờ</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 2, paddingRight: 8 }}
              >
                {manualStopDayOptions.map((option) => (
                  <SelectableCard
                    key={option.dayIndex}
                    title={`Ngày ${option.dayIndex + 1}`}
                    subtitle={formatDateDisplay(option.date)}
                    selected={manualStopDayIndex === option.dayIndex}
                    onPress={() => onSelectDayIndex(option.dayIndex, option.date)}
                    backgroundColor={manualStopDayIndex === option.dayIndex ? '#EFF6FF' : 'white'}
                    containerStyle={{ width: 156, paddingVertical: 10, borderRadius: 12 }}
                  />
                ))}
              </ScrollView>

              <View className="flex-row" style={{ gap: 8 }}>
                <Button
                  onPress={onOpenStartTimePicker}
                  className="flex-1 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' }}
                >
                  <Text style={{ color: '#111827', fontWeight: '600' }}>Bắt đầu: {formatDateToHHmm(manualStopStartTime)}</Text>
                </Button>

                <Button
                  onPress={onOpenEndTimePicker}
                  className="flex-1 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' }}
                >
                  <Text style={{ color: '#111827', fontWeight: '600' }}>Kết thúc: {formatDateToHHmm(manualStopEndTime)}</Text>
                </Button>
              </View>
            </View>

            <View style={{ height: 12 }} />
          </ScrollView>

          <View className="px-5 pt-3" style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
            <Button
              onPress={onAddManualStop}
              className="items-center py-3 rounded-xl"
              style={{ backgroundColor: '#DCFCE7' }}
            >
              <Text style={{ color: '#166534', fontWeight: '700' }}>Lưu stop thủ công</Text>
            </Button>

            <Button
              onPress={onClose}
              className="items-center py-3"
            >
              <Text style={{ color: '#6B7280', fontWeight: '600' }}>Đóng</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
