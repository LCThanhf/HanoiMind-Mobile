import { AIPlanRequest, AiMood } from '../../../services/aiService/ai.type';
import { JourneyMood } from '../../../services/journeyService/journey.type';

type TravelStyle = 'sightseeing' | 'relaxing' | 'balanced';

export interface MoodVoteEntryLike {
  mood?: string | null;
  voted_at?: string | null;
}

export interface JourneyLikeForMoodPlanning {
  planned_members_count?: number;
  total_budget?: number;
  primary_mood?: JourneyMood | string | null;
  members?: unknown[];
  days?: unknown[];
}

export interface DayPlanLikeForMoodPlanning {
  stops: { placeId?: string | null }[];
}

export interface BudgetSummaryLikeForMoodPlanning {
  limit: number;
  planned: number;
}

const FALLBACK_AI_MOOD_ORDER: AiMood[] = [
  'RESET_HEALING',
  'FOOD_LOCAL',
  'NATURE_EXPLORE',
  'CHILL_CAFE',
];

const journeyMoodToAiMoodMap: Partial<Record<JourneyMood, AiMood>> = {
  [JourneyMood.RESET_HEALING]: 'RESET_HEALING',
  [JourneyMood.FOOD_ADVENTURE]: 'FOOD_LOCAL',
  [JourneyMood.NATURE_RELAX]: 'NATURE_EXPLORE',
  [JourneyMood.FUN_ENTERTAINMENT]: 'CHILL_CAFE',
  // Suy luận gần nhất vì AI backend hiện chưa có mood riêng cho văn hóa/lịch sử.
  [JourneyMood.CULTURE_HISTORY]: 'NATURE_EXPLORE',
};

const aiMoodToTravelStyleMap: Record<AiMood, TravelStyle> = {
  RESET_HEALING: 'relaxing',
  FOOD_LOCAL: 'balanced',
  NATURE_EXPLORE: 'sightseeing',
  CHILL_CAFE: 'balanced',
};

export const toAiMoodFromJourneyMood = (mood?: string | null): AiMood | null => {
  if (!mood) return null;

  const normalizedMood = String(mood).trim() as JourneyMood;
  return journeyMoodToAiMoodMap[normalizedMood] || null;
};

export const buildMoodVoteDistribution = (
  entries: MoodVoteEntryLike[]
): Partial<Record<AiMood, number>> => {
  const counts = new Map<AiMood, number>();

  entries.forEach((entry) => {
    const aiMood = toAiMoodFromJourneyMood(entry.mood);
    if (!aiMood) return;

    counts.set(aiMood, (counts.get(aiMood) || 0) + 1);
  });

  const totalVotes = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  if (!totalVotes) return {};

  return FALLBACK_AI_MOOD_ORDER.reduce<Partial<Record<AiMood, number>>>((acc, mood) => {
    const count = counts.get(mood);
    if (!count) return acc;

    acc[mood] = Number((count / totalVotes).toFixed(4));
    return acc;
  }, {});
};

export const getDominantAiMood = (
  entries: MoodVoteEntryLike[],
  fallbackMood?: string | null
): AiMood | null => {
  const stats = new Map<AiMood, { count: number; latestVoteTs: number }>();

  entries.forEach((entry) => {
    const aiMood = toAiMoodFromJourneyMood(entry.mood);
    if (!aiMood) return;

    const previous = stats.get(aiMood) || { count: 0, latestVoteTs: 0 };
    const votedAtTs = entry.voted_at ? new Date(entry.voted_at).getTime() : 0;

    stats.set(aiMood, {
      count: previous.count + 1,
      latestVoteTs: Number.isNaN(votedAtTs) ? previous.latestVoteTs : Math.max(previous.latestVoteTs, votedAtTs),
    });
  });

  const ranked = Array.from(stats.entries()).sort((left, right) => {
    const [, leftMeta] = left;
    const [, rightMeta] = right;

    if (rightMeta.count !== leftMeta.count) {
      return rightMeta.count - leftMeta.count;
    }

    if (rightMeta.latestVoteTs !== leftMeta.latestVoteTs) {
      return rightMeta.latestVoteTs - leftMeta.latestVoteTs;
    }

    return FALLBACK_AI_MOOD_ORDER.indexOf(left[0]) - FALLBACK_AI_MOOD_ORDER.indexOf(right[0]);
  });

  if (ranked.length > 0) {
    return ranked[0][0];
  }

  return toAiMoodFromJourneyMood(fallbackMood);
};

export const buildMoodVoteAiPlanPayload = ({
  journey,
  dayPlans,
  budgetSummary,
  moodVoteEntries,
}: {
  journey: JourneyLikeForMoodPlanning;
  dayPlans: DayPlanLikeForMoodPlanning[];
  budgetSummary: BudgetSummaryLikeForMoodPlanning;
  moodVoteEntries: MoodVoteEntryLike[];
}): AIPlanRequest | null => {
  const allPlaceIds = Array.from(
    new Set(dayPlans.flatMap((day) => day.stops.map((stop) => stop.placeId)).filter(Boolean))
  ) as string[];

  if (!allPlaceIds.length) return null;

  const totalDays = Math.max(dayPlans.length, journey.days?.length || 0, 1);
  const totalBudget = Math.max(Number(budgetSummary.limit || 0), Number(budgetSummary.planned || 0), Number(journey.total_budget || 0));
  const dailyBudget = totalBudget > 0 ? Math.min(Math.max(Math.floor(totalBudget / totalDays), 150000), totalBudget) : 0;
  const maxPlacesPerDay = Math.min(5, Math.max(1, Math.max(...dayPlans.map((day) => day.stops.length), 3)));
  const inferredMode: 'solo' | 'group' =
    Math.max(Number(journey.planned_members_count || 0), journey.members?.length || 0, 1) > 1 ? 'group' : 'solo';

  const dominantMood = getDominantAiMood(moodVoteEntries, journey.primary_mood);
  const moodDistribution = buildMoodVoteDistribution(moodVoteEntries);

  if (!dominantMood && !Object.keys(moodDistribution).length) {
    return null;
  }

  const payload: AIPlanRequest = {
    total_days: totalDays,
    total_budget_vnd: totalBudget,
    daily_budget_vnd: dailyBudget,
    mode: inferredMode,
    max_places_per_day: maxPlacesPerDay,
    travel_style: dominantMood ? aiMoodToTravelStyleMap[dominantMood] : 'balanced',
    place_ids: allPlaceIds,
  };

  if (inferredMode === 'group') {
    payload.mood_distribution =
      Object.keys(moodDistribution).length > 0
        ? moodDistribution
        : dominantMood
          ? { [dominantMood]: 1 }
          : undefined;
  } else if (dominantMood) {
    payload.mood = dominantMood;
  }

  return payload;
};
