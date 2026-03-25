export type MoodId = 'reset' | 'chill' | 'explore' | 'food';

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
