import { JourneyTag } from '../../services/journeyService/journey.type';
import { AiMood } from '../../services/aiService/ai.type';
import { MoodId, MoodOption } from './types';

export const moodOptions: MoodOption[] = [
  {
    id: 'reset',
    title: 'Reset & Healing',
    budget: '500k - 800k/ngay',
    icon: 'healing',
    color: '#22C55E',
    bgColor: '#ECFDF5',
  },
  {
    id: 'chill',
    title: 'Chill & Cafe',
    budget: '400k - 700k/ngay',
    icon: 'cafe',
    color: '#2B8EF0',
    bgColor: '#EBF5FF',
  },
  {
    id: 'explore',
    title: 'Explore Nature',
    budget: '600k - 900k/ngay',
    icon: 'nature',
    color: '#D4A574',
    bgColor: '#FEF3E2',
  },
  {
    id: 'food',
    title: 'Food & Local',
    budget: '800k - 1.2M/ngay',
    icon: 'food',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
];

export const moodTagMap: Record<MoodId, JourneyTag> = {
  reset: JourneyTag.RELAX,
  chill: JourneyTag.CHILL,
  explore: JourneyTag.NATURE,
  food: JourneyTag.FOODIE,
};

export const moodAiMap: Record<MoodId, AiMood> = {
  reset: 'RESET_HEALING',
  chill: 'CHILL_CAFE',
  explore: 'NATURE_EXPLORE',
  food: 'FOOD_LOCAL',
};
