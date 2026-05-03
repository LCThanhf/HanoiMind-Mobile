import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Text,
  UIManager,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { JourneyMood } from '../../../services/journeyService/journey.type';
import { Button, PillBadge } from '../../shared';
import { MoodVoteOption } from './types';

const debugMoodVoteSelector = (...args: unknown[]) => {
  if (__DEV__) {
    console.log('[MoodVoteSelector]', ...args);
  }
};

const StarSparkleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
      fill="#F59E0B"
      stroke="#F59E0B"
      strokeLinejoin="round"
    />
  </Svg>
);

const moodIconById: Record<string, React.ReactElement> = {
  relax: (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C12 22 20 18 20 10C20 2 12 2 12 2C12 2 4 2 4 10C4 18 12 22 12 22Z" fill="#BEF264" />
      <Path d="M12 22V10M12 14C10 12 8 13 8 13" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  foodie: (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12C4 16 7 20 12 20C17 20 20 16 20 12H4Z" fill="#F43F5E" />
      <Path d="M2 12H22M8 4H16M10 8H14" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 3V7M12 2V6M16 3V7" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  ),
  nature: (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22V15" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
      <Path d="M12 15L8 20M12 15L16 20M12 3C8 3 5 6 5 10C5 13 7.5 15 12 15C16.5 15 19 13 19 10C19 6 16 3 12 3Z" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  chill: (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M21 3L14 10M14 10L10 14M14 10L18 14M14 10L10 6M3 21L10 14M21 8V3H16M3 5L5 7M6 2L8 4M19 19L17 17M22 18L20 16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 16L12 12M18 12L20 10M16 12L18 14" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  ),
};

export const moodIdToJourneyMood: Record<string, JourneyMood> = {
  relax: JourneyMood.RESET_HEALING,
  foodie: JourneyMood.FOOD_ADVENTURE,
  nature: JourneyMood.NATURE_RELAX,
  chill: JourneyMood.FUN_ENTERTAINMENT,
};

export interface MoodSelectorItem extends MoodVoteOption {
  icon: React.ReactElement;
}

interface MoodVoteSelectorProps {
  tripName: string;
  options: MoodVoteOption[];
  selectedMood: string;
  onMoodChange: (id: string) => void;
}

interface MoodOptionRowProps {
  item: MoodSelectorItem;
  selectedMood: string;
  onPress: (id: string) => void;
}

const MoodOptionRow = memo(({ item, selectedMood, onPress }: MoodOptionRowProps) => {
  const isActive = selectedMood === item.id;
  const handlePress = useCallback(() => {
    debugMoodVoteSelector('row press', {
      itemId: item.id,
      wasActive: isActive,
    });
    onPress(item.id);
  }, [isActive, item.id, onPress]);

  debugMoodVoteSelector('row render', {
    itemId: item.id,
    isActive,
  });

  return (
    <Button
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginHorizontal: 6,
        marginVertical: 4,
        borderRadius: 14,
        backgroundColor: isActive ? '#EBF5FF' : 'transparent',
        borderWidth: isActive ? 1 : 0,
        borderColor: isActive ? '#2B8EF0' : 'transparent',
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: isActive ? '#2B8EF0' : '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {item.icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }} numberOfLines={2}>
          {item.desc}
        </Text>
      </View>

      {isActive ? (
        <View style={{ marginLeft: 8 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="11" fill="#2B8EF0" stroke="white" strokeWidth="2" />
            <Path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      ) : null}
    </Button>
  );
});

export const MoodVoteSelector = memo(({
  tripName,
  options,
  selectedMood,
  onMoodChange,
}: MoodVoteSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const openProgress = React.useRef(new Animated.Value(0)).current;
  const renderCountRef = React.useRef(0);
  const previousStateRef = React.useRef({
    isOpen,
    selectedMood,
    optionsLength: options.length,
    tripName,
  });

  renderCountRef.current += 1;

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    Animated.timing(openProgress, {
      toValue: isOpen ? 1 : 0,
      duration: isOpen ? 220 : 180,
      easing: isOpen ? Easing.out(Easing.cubic) : Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isOpen, openProgress]);

  const moods = useMemo<MoodSelectorItem[]>(
    () =>
      options.map((option) => ({
        ...option,
        icon: moodIconById[option.id] || moodIconById.chill,
      })),
    [options]
  );

  const activeMood = useMemo(
    () => moods.find((mood) => mood.id === selectedMood),
    [moods, selectedMood]
  );

  const closeDropdown = useCallback(() => {
    debugMoodVoteSelector('close dropdown');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    debugMoodVoteSelector('toggle dropdown');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((id: string) => {
    debugMoodVoteSelector('select mood', {
      previousMood: selectedMood,
      nextMood: id,
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onMoodChange(id);
    setIsOpen(false);
  }, [onMoodChange, selectedMood]);

  debugMoodVoteSelector('render', {
    renderCount: renderCountRef.current,
    isOpen,
    selectedMood,
    optionsLength: options.length,
    tripName,
  });

  React.useEffect(() => {
    const previous = previousStateRef.current;
    const changedFields = {
      isOpen: previous.isOpen !== isOpen,
      selectedMood: previous.selectedMood !== selectedMood,
      optionsLength: previous.optionsLength !== options.length,
      tripName: previous.tripName !== tripName,
    };

    debugMoodVoteSelector('commit', {
      renderCount: renderCountRef.current,
      changedFields,
      state: {
        isOpen,
        selectedMood,
        optionsLength: options.length,
        tripName,
      },
    });

    previousStateRef.current = {
      isOpen,
      selectedMood,
      optionsLength: options.length,
      tripName,
    };
  }, [isOpen, options.length, selectedMood, tripName]);

  const dropdownOpacity = openProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const dropdownTranslateY = openProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  const arrowRotate = openProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <StarSparkleIcon />
          <Text className="text-[15px] text-gray-900 ml-2" style={{ fontWeight: '700' }}>
            Lựa chọn của bạn
          </Text>
        </View>
        <PillBadge
          label={tripName}
          backgroundColor="#F3F4F6"
          textColor="#4B5563"
          textWeight="500"
          borderColor="#E5E7EB"
        />
      </View>

      <View
        style={{
          marginBottom: 8,
        }}
      >
        <Button
          activeOpacity={0.75}
          onPress={toggleDropdown}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: isOpen ? '#2B8EF0' : '#E5E7EB',
            shadowColor: '#0F172A',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#2B8EF0',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            {activeMood?.icon}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
              {activeMood ? activeMood.title : 'Chọn mood của bạn'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>
              {activeMood?.desc ?? 'Nhấn để xem các lựa chọn'}
            </Text>
          </View>

          <Animated.View style={{ marginLeft: 8, transform: [{ rotate: arrowRotate }] }}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9l6 6 6-6"
                stroke="#6B7280"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </Button>

        {isOpen ? (
          <Animated.View
            pointerEvents="auto"
            style={{
              marginTop: 8,
              opacity: dropdownOpacity,
              transform: [{ translateY: dropdownTranslateY }],
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                paddingTop: 8,
                paddingBottom: 8,
                shadowColor: '#0F172A',
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
              }}
            >
              <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                  Chọn mood của bạn
                </Text>
              </View>

              <View>
                {moods.map((item) => (
                  <MoodOptionRow
                    key={item.id}
                    item={item}
                    selectedMood={selectedMood}
                    onPress={handleSelect}
                  />
                ))}
              </View>

              <View
                style={{
                  paddingHorizontal: 12,
                  paddingTop: 10,
                  paddingBottom: 4,
                  marginTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: '#F3F4F6',
                }}
              >
                <Button
                  label="Đóng"
                  variant="secondary"
                  onPress={closeDropdown}
                  style={{
                    height: 48,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </View>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
});
