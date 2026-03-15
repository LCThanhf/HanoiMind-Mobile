// journeyService/journey-draft.type.ts
import { JourneyTag, JourneyVisibility, CostType, StopStatus } from './journey.type';

export interface DraftStop {
  place_id: string;
  place_name: string;
  estimated_cost_vnd: number;
  estimated_duration_minutes: number;
  reason: string; // Lý do AI gợi ý điểm này
  order: number;
  latitude: number;
  longitude: number;
  category: string;
  travel_time_from_previous_minutes: number;
  distance_from_previous_km: number;
}

export interface DraftDayPlan {
  day_number: number;
  date: string;
  stops: DraftStop[];
  total_estimated_cost_vnd: number;
  summary: string; // Tóm tắt hoạt động trong ngày
}

export interface JourneyDraft {
  _id: string;
  journey_id: string;
  user_id: string;
  mood_used: string;
  days: DraftDayPlan[];
  candidate_pool: any[]; // Danh sách các địa điểm dự phòng để thay thế
  planning_notes: string[];
  total_budget_vnd: number;
  createdAt: string;
}

export interface SwapPlacePayload {
  dayNumber: number;
  oldPlaceId: string;
  newPlaceId: string;
}