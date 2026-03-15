// src/services/journeyService/journey.types.ts

export enum JourneyStatus {
  PLANNING = 'PLANNING',
  UPCOMING = 'UPCOMING',
  ON_GOING = 'ON_GOING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum JourneyVisibility {
  PRIVATE = 'PRIVATE',
  FRIENDS = 'FRIENDS',
  PUBLIC = 'PUBLIC'
}

export enum JourneyMemberRole {
  HOST = 'HOST',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum StopStatus {
  PENDING = 'PENDING',
  INFO_ONLY = 'INFO_ONLY',
  ARRIVED = 'ARRIVED',
  SKIPPED = 'SKIPPED'
}

export enum CostType {
  SHARED = 'SHARED',
  PER_PERSON = 'PER_PERSON'
}

export interface TransitInfo {
  mode: 'DRIVING' | 'WALKING' | 'PUBLIC_TRANSPORT' | 'FLIGHT' | 'BOAT';
  distance_km: number;
  duration_minutes: number;
  from_place_id: string;
}

export interface JourneyStop {
  _id: string;
  place_id: string;
  start_time: string | null;
  end_time: string;
  note?: string;
  estimated_cost: number;
  sequence: number;
  status: StopStatus;
  transit_from_previous?: TransitInfo | null;
  participant_ids?: string[];
  is_prepaid?: boolean;
  actual_cost?: number;
}

export interface JourneyDay {
  id: string;
  day_number: number;
  date: string;
  stops: JourneyStop[];
  warnings?: string[];
}

export interface JourneyMember {
  user_id: string;
  role: JourneyMemberRole;
  joined_at: string;
}

export interface Journey {
  _id: string;
  name: string;
  owner_id: string;
  members: JourneyMember[];
  start_date: string;
  end_date: string;
  status: JourneyStatus;
  visibility: JourneyVisibility;
  days: JourneyDay[];
  invite_code?: string;
  total_budget: number;
  cost_per_person: number;
  planned_members_count: number;
}

// DTO Payloads
export interface CreateJourneyPayload {
  name: string;
  start_date: string;
  end_date: string;
  budget_limit?: number;
  planned_members_count?: number;
  visibility?: JourneyVisibility;
}

export interface AddStopPayload {
  day_index: number;
  place_id: string;
  start_time?: string;
  end_time: string;
  note?: string;
  estimated_cost?: number;
  cost_type?: CostType;
  participant_ids?: string[];
  is_prepaid?: boolean;
  checkout_day_index?: number; // Dành cho khách sạn
  checkout_time?: string;     // Dành cho khách sạn
}