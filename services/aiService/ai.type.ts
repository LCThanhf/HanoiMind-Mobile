// aiService/ai.type.ts

export interface AiStop {
  place_id: string;
  place_name: string;
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
}

export interface AiDayPlan {
  day_number: number;
  date: string;
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