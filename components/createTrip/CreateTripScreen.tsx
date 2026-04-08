import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SparkleIcon } from './icons';
import { StepOneInfo } from './StepOneInfo';
import { StepTwoPlaces } from './StepTwoPlaces';
import { StepTwoManualStops } from './StepTwoManualStops';
import { StepThreeConfirm } from './StepThreeConfirm';
import { PlanningModeModal } from './PlanningModeModal';
import { ManualStopModal } from './ManualStopModal';
import { Button } from '../shared';
import { useCreateTrip } from './useCreateTrip';
import { moodOptions } from './constants';

export const CreateTripScreen = ({
  onClose,
  onJourneyCreated,
}: {
  onClose?: () => void;
  onJourneyCreated?: (journeyId: string) => void;
}) => {
  const insets = useSafeAreaInsets();
  
  const {
    currentStep, setCurrentStep,
    tripName, setTripName,
    startDate,
    endDate,
    showDatePicker,
    draftDate,
    budget, setBudget,
    selectedMood, setSelectedMood,
    isSoloMode, setIsSoloMode,
    planningMode, setPlanningMode,

    manualStops, setManualStops,
    showManualStopModal,
    manualPlaceKeyword, setManualPlaceKeyword,
    manualPlaceResults,
    manualPlaceLoading,
    selectedManualPlace, setSelectedManualPlace,
    manualStopDayIndex, setManualStopDayIndex,
    setManualStopDate,
    manualStopStartTime,
    manualStopEndTime,
    manualPickerMode, setManualPickerMode,
    showPlanningModeModal, setShowPlanningModeModal,

    places,
    placesLoading,
    loadingMorePlaces,
    placesSearch, setPlacesSearch,
    placesPage,
    hasMorePlaces,
    selectedPlaceIds,
    isAiSelectingPlaces,

    isProcessing,

    openDatePicker,
    handleDatePickerChange,
    openManualStopModal,
    closeManualStopModal,
    addManualStop,
    handleManualPickerChange,
    handleAiSelectPlaces,
    fetchPlaces,

    selectedPlaceSummaries,
    selectedPlaceDetails,
    manualStopDetails,
    formatCurrencyVnd,
    togglePlace,
    removeSelectedPlace,
    handleProceed,

    actionLabel,
    dateRangeSummary,
    stepConfig,
    manualStopDayOptions,
    
    formatDateDisplay,
    formatDateToHHmm
  } = useCreateTrip({ onClose, onJourneyCreated });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 pt-12 pb-4">
        <Button onPress={onClose} activeOpacity={0.7}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6l12 12" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Button>
        <Text className="text-[17px] text-gray-900" style={{ fontWeight: '600' }}>
          Tạo chuyến đi mới
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="h-px bg-gray-200" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Pressable>
          <View className="flex-row items-center justify-center px-10 py-6">
            {stepConfig.map((step, index) => (
              <React.Fragment key={step.key}>
                <View className="items-center">
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: currentStep >= step.value ? '#2B8EF0' : 'transparent',
                      borderWidth: currentStep >= step.value ? 0 : 1.5,
                      borderColor: '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text className="text-[13px]" style={{ color: currentStep >= step.value ? 'white' : '#9CA3AF', fontWeight: '600' }}>
                      {step.key}
                    </Text>
                  </View>
                  <Text className="text-[10px] mt-1.5" style={{ color: currentStep >= step.value ? '#2B8EF0' : '#9CA3AF', fontWeight: '500' }}>
                    {step.label}
                  </Text>
                </View>

                {index < stepConfig.length - 1 ? (
                  <View
                    style={{
                      flex: 1,
                      height: 1.5,
                      backgroundColor: currentStep >= stepConfig[index + 1].value ? '#2B8EF0' : '#E5E7EB',
                      marginHorizontal: 8,
                      marginBottom: 18,
                    }}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </View>

          {currentStep === 1 ? (
            <StepOneInfo
              tripName={tripName}
              onChangeTripName={setTripName}
              startDate={startDate}
              endDate={endDate}
              onOpenDatePicker={openDatePicker}
              budget={budget}
              onChangeBudget={setBudget}
              selectedMood={selectedMood}
              onSelectMood={setSelectedMood}
              isSoloMode={isSoloMode}
              onToggleMode={() => setIsSoloMode((prev) => !prev)}
            />
          ) : null}

          {currentStep === 2 && planningMode === 'ai' ? (
            <StepTwoPlaces
              selectedPlaceIds={selectedPlaceIds}
              selectedPlaceSummaries={selectedPlaceSummaries}
              onRemoveSelectedPlace={removeSelectedPlace}
              isAiSelectingPlaces={isAiSelectingPlaces}
              isProcessing={isProcessing}
              placesLoading={placesLoading}
              onAiSelectPlaces={handleAiSelectPlaces}
              placesSearch={placesSearch}
              onChangePlacesSearch={setPlacesSearch}
              filteredPlaces={places}
              onTogglePlace={togglePlace}
              hasMorePlaces={hasMorePlaces}
              loadingMorePlaces={loadingMorePlaces}
              onLoadMorePlaces={() => fetchPlaces({ nextPage: placesPage + 1, reset: false })}
            />
          ) : null}

          {currentStep === 2 && planningMode === 'manual' ? (
            <StepTwoManualStops
              manualStops={manualStops}
              onAddManualStop={openManualStopModal}
              onRemoveManualStop={(stopId) => setManualStops((prev) => prev.filter((stop) => stop.id !== stopId))}
            />
          ) : null}

          {currentStep === 3 ? (
            <StepThreeConfirm
              tripName={tripName}
              dateRangeSummary={dateRangeSummary}
              isSoloMode={isSoloMode}
              selectedMoodTitle={moodOptions.find((m) => m.id === selectedMood)?.title}
              budget={budget}
              selectedPlaces={planningMode === 'manual' ? manualStopDetails : selectedPlaceDetails}
              planningMode={planningMode}
            />
          ) : null}

          <View className="h-24" />
        </Pressable>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-4 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        {currentStep > 1 ? (
          <Button
            onPress={() => {
              setCurrentStep((prev) => (prev === 3 ? 2 : 1));
            }}
            activeOpacity={0.8}
            style={{ alignItems: 'center', marginBottom: 8 }}
          >
            <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600' }}>Quay lại bước trước</Text>
          </Button>
        ) : null}

        <Button
          label={actionLabel}
          onPress={handleProceed}
          loading={isProcessing}
          rightSlot={!isProcessing ? <View style={{ marginLeft: 8 }}><SparkleIcon /></View> : null}
          style={{
            minHeight: 60,
            borderRadius: 16,
            shadowColor: '#2B8EF0',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 5,
          }}
        />
      </View>

      {showDatePicker ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
        />
      ) : null}

      <PlanningModeModal
        visible={showPlanningModeModal}
        onClose={() => setShowPlanningModeModal(false)}
        planningMode={planningMode}
        onSelectMode={(mode) => {
          setPlanningMode(mode);
          setShowPlanningModeModal(false);
          setCurrentStep(2);
        }}
      />

      <ManualStopModal
        visible={showManualStopModal}
        onClose={closeManualStopModal}
        manualPlaceKeyword={manualPlaceKeyword}
        onChangeKeyword={setManualPlaceKeyword}
        manualPlaceLoading={manualPlaceLoading}
        manualPlaceResults={manualPlaceResults}
        selectedManualPlace={selectedManualPlace}
        onSelectManualPlace={setSelectedManualPlace}
        manualStopDayOptions={manualStopDayOptions}
        manualStopDayIndex={manualStopDayIndex}
        onSelectDayIndex={(index, date) => {
          setManualStopDayIndex(index);
          setManualStopDate(date);
        }}
        manualStopStartTime={manualStopStartTime}
        manualStopEndTime={manualStopEndTime}
        onOpenStartTimePicker={() => setManualPickerMode('start-time')}
        onOpenEndTimePicker={() => setManualPickerMode('end-time')}
        onAddManualStop={addManualStop}
        insetsBottom={insets.bottom}
        formatCurrencyVnd={formatCurrencyVnd}
        formatDateDisplay={formatDateDisplay}
        formatDateToHHmm={formatDateToHHmm}
      />

      {manualPickerMode ? (
        <DateTimePicker
          value={manualPickerMode === 'start-time' ? manualStopStartTime : manualStopEndTime}
          mode="time"
          display="default"
          onChange={handleManualPickerChange}
        />
      ) : null}
    </SafeAreaView>
  );
};
