import { CostType, JourneyMemberRole } from '../../services/journeyService/journey.type';

export interface StopCostItem {
  dayId: string;
  dayNumber: number;
  stopSequence: number;
  stopId: string;
  placeId: string;
  placeName: string;
  estimatedCost: number;
  actualCost?: number;
  isPrepaid: boolean;
  costType: CostType;
  payerUserId?: string;
  payerName?: string;
  payerAvatar?: string;
  participantIds: string[];
}

export interface MemberProfile {
  userId: string;
  name: string;
  avatar?: string;
  role?: JourneyMemberRole;
}
