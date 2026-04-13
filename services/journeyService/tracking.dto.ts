// services/journeyService/tracking.dto.ts

/**
 * DTO cho các hoạt động tracking / check-in trong chuyến đi
 */

export interface ResumeJourneyDto {
  new_start_date: string;
}

export interface CheckInStopDto {
  check_in_image?: string;
}

export interface TrackingActionResult {
  success: boolean;
  message: string;
  data?: any;
}
