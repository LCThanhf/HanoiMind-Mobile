import { JourneyTag } from '../../../services/journeyService/journey.type';
import { AiMood } from '../../../services/aiService/ai.type';
import { AppColors } from '../../../utils/theme';
import { MoodId, MoodOption } from './types';

export const moodOptions: MoodOption[] = [
  {
    id: 'reset',
    title: 'Reset & Healing',
    budget: '500k - 800k/ngày',
    icon: 'healing',
    color: AppColors.status.success,
    bgColor: '#ECFDF5',
  },
  {
    id: 'chill',
    title: 'Chill & Cafe',
    budget: '400k - 700k/ngày',
    icon: 'cafe',
    color: AppColors.brand.primary,
    bgColor: AppColors.brand.primarySoft,
  },
  {
    id: 'explore',
    title: 'Explore Nature',
    budget: '600k - 900k/ngày',
    icon: 'nature',
    color: '#D4A574',
    bgColor: '#FEF3E2',
  },
  {
    id: 'food',
    title: 'Food & Local',
    budget: '800k - 1.2M/ngày',
    icon: 'food',
    color: AppColors.status.danger,
    bgColor: AppColors.status.dangerSoft,
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
