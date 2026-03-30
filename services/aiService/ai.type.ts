// aiService/ai.type.ts

export interface AiStop {
  place_id: string;
  place_name: string;
  start_time?: string | null;
  end_time?: string | null;
  estimated_cost_vnd: number;
  estimated_duration_minutes: number;
  reason: string;
  order: number;
  latitude: number;
  longitude: number;
  category: string;
  final_score: number;
  travel_time_from_previous_minutes: number;
  distance_from_previous_km: number;
  is_hotel_anchor?: boolean;
  checkin_day_index?: number;
  checkin_time?: string | null;
  checkout_day_index?: number;
  checkout_time?: string | null;
}

export interface AiDayPlan {
  day_number: number;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  stops: AiStop[];
  total_estimated_cost_vnd: number;
  summary: string;
}

export interface AiProposal {
  _id: string;
  journey_id: string;
  user_id: string;
  mood_used: string;
  days: AiDayPlan[];
  candidate_pool: any[]; // Các điểm dự phòng để swap
  planning_notes: string[];
  total_budget_vnd: number;
  createdAt: string;
}

export interface RequestAiPlanPayload {
  total_days?: number;
  mode: 'solo' | 'group';
  mood: string;
  mood_distribution?: Record<string, number>;
  total_budget_vnd?: number;
  daily_budget_vnd?: number;
  hours_per_day?: number;
  travel_style: 'sightseeing' | 'relaxing' | 'balanced';
  max_places_per_day?: number;
  must_include_categories?: string[];
  exclude_categories?: string[];
}

export interface SuggestNextParams {
  seed_place_id?: string;
  max_places?: number;
}

export type AiMood = 'RESET_HEALING' | 'CHILL_CAFE' | 'NATURE_EXPLORE' | 'FOOD_LOCAL';

export interface CreateJourneyFromRelatedRequest {
  name: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  seed_place_id?: string;
  max_places?: number;
  hours_per_day?: number;
  travel_style?: 'sightseeing' | 'relaxing' | 'balanced';
  total_budget_vnd?: number;
  daily_budget_vnd?: number;
  mode?: 'solo' | 'group';
  mood?: AiMood;
  auto_plan?: boolean;
  members?: string[];
  start_location?: Record<string, number>;
  must_include_categories?: string[];
  exclude_categories?: string[];
}

export interface CreateJourneyFromRelatedResponse {
  journey_id: string;
  journey_name: string;
  selected_places_count: number;
  selected_place_ids: string[];
  auto_planned: boolean;
  total_days: number;
  planning_notes?: string[];
  candidate_pool?: any[] | null;
  days?: AiDayPlan[] | null;
  candidate_pool_size?: number | null;
  generation_time_ms?: number | null;
}

export interface AIPlanRequest {
  total_days?: number;
  total_budget_vnd: number;
  daily_budget_vnd: number;
  mode?: 'solo' | 'group';
  requester_user_id?: string;
  mood?: AiMood;
  mood_distribution?: Partial<Record<AiMood, number>>;
  start_location?: Record<string, number>;
  max_places_per_day?: number;
  must_include_categories?: string[];
  exclude_categories?: string[];
  hours_per_day?: number;
  travel_style?: 'sightseeing' | 'relaxing' | 'balanced';
  place_ids?: string[];
}

export interface AIPlanResponse {
  journey_id: string;
  journey_name: string;
  start_time?: string | null;
  end_time?: string | null;
  total_days: number;
  mode: 'solo' | 'group';
  mood_used?: AiMood | null;
  mood_distribution_used?: Record<AiMood, number> | null;
  total_budget_vnd: number;
  daily_budget_vnd: number;
  generated_at: string;
  candidate_pool_size: number;
  generation_time_ms: number;
  hotel_name?: string | null;
  accommodation_cost_vnd?: number;
  num_nights?: number;
  days: AiDayPlan[];
  candidate_pool?: any[];
  planning_notes: string[];
  algorithm_version?: string;
}