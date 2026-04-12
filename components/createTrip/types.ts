export type MoodId = 'reset' | 'chill' | 'explore' | 'food';

export type PlanningMode = 'ai' | 'manual';

export interface ManualStopDraft {
  id: string;
  placeId: string;
  placeName: string;
  thumbnail?: string;
  dayIndex?: number;
  dayLabel?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  estimatedCost?: number;
}

export interface MoodOption {
  id: MoodId;
  title: string;
  budget: string;
  icon: 'healing' | 'cafe' | 'nature' | 'food';
  color: string;
  bgColor: string;
}

export interface SelectedPlaceSummary {
  id: string;
  name: string;
}
