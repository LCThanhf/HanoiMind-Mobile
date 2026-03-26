export enum JourneyStatus {
  PLANNING = 'PLANNING',
  UPCOMING = 'UPCOMING',
  ON_GOING = 'ON_GOING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum JourneyTag {
  BEACH = 'BEACH',
  MOUNTAIN = 'MOUNTAIN',
  FOODIE = 'FOODIE',
  ADVENTURE = 'ADVENTURE',
  RELAX = 'RELAX',
  CULTURE = 'CULTURE',
  FAMILY = 'FAMILY',
  COUPLE = 'COUPLE',
  CHILL = 'CHILL',
  NATURE = 'NATURE',
  CITY = 'CITY',
  HISTORICAL = 'HISTORICAL',
  CHILD_FRIENDLY = 'CHILD_FRIENDLY',
  AGE_RESTRICTED = 'AGE_RESTRICTED',
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
  PER_PERSON = 'PER_PERSON',
  CUSTOM = 'CUSTOM' // Đã thêm chia tùy chỉnh
}

// --- CÁC INTERFACE TÀI CHÍNH (MỚI) ---
export interface PayerDetail {
  user_id: string;
  amount_paid: number;
}

export interface SplitDetail {
  user_id: string;
  amount_owed: number;
}

export interface MemberBalance {
  user_id: string;
  total_spent: number;
  total_estimated: number;
}

export interface BudgetAnalysis {
  target_fund: number;
  total_fund_spent: number;
  remaining_fund: number;
  total_shared: number;
  share_per_person: number;
  total_personal: number;
  grand_total_per_person: number;
  is_over_budget: boolean;
  over_amount: number;
  member_balances: MemberBalance[];
}
// ------------------------------------

export interface TransitInfo {
  mode: 'DRIVING' | 'WALKING' | 'PUBLIC_TRANSPORT' | 'FLIGHT' | 'BOAT';
  distance_km: number;
  duration_minutes: number;
  from_place_id: string;
}

export interface ParticipantCheckIn {
  user_id: string;
  checked_in_at: string;
  check_in_image?: string;
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
  // Bổ sung các trường tài chính N-N
  cost_type?: CostType;
  payers?: PayerDetail[];
  splits?: SplitDetail[];
  participant_checkins?: ParticipantCheckIn[];
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
  avatar?: string | null;
  tags: JourneyTag[];
  // Bổ sung phân tích ngân sách từ backend
  budget_analysis?: BudgetAnalysis;
}

// ==========================================
// DTO Payloads
// ==========================================

export interface CreateJourneyPayload {
  name: string;
  start_date: string;
  end_date: string;
  budget_limit?: number;
  planned_members_count?: number;
  visibility?: JourneyVisibility;
  avatar?: string;
  tags?: JourneyTag[];
}

export interface UpdateJourneyPayload extends Partial<CreateJourneyPayload> {}

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
  checkout_day_index?: number;
  checkout_time?: string;
  is_manual_cost?: boolean;
}

export interface GetPublicFeedParams {
  search?: string;
  tag?: JourneyTag;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
}

// [MỚI] Payload cho API Cập nhật điểm dừng & Thanh toán
export interface UpdateStopPayload {
  start_time?: string;
  end_time?: string;
  note?: string;
  estimated_cost?: number;
  is_manual_cost?: boolean;
  cost_type?: CostType;
  participant_ids?: string[];
  is_prepaid?: boolean;
  actual_cost?: number;
  payers?: PayerDetail[];
  splits?: SplitDetail[];
}