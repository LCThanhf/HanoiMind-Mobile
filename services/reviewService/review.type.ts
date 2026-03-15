export enum ReviewFilter {
  POSITIVE = 'POSITIVE', // Rating >= 4
  NEGATIVE = 'NEGATIVE', // Rating <= 2
  ALL = 'ALL',
}

export enum ReviewSortBy {
  DATE = 'created_at',
  RATING = 'rating',
  HELPFUL = 'helpful_count',
}

export interface ReviewCriteria {
  cleanliness: number;
  service: number;
  location: number;
  price: number;
}

export interface Review {
  _id: string;
  place_id: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  } | null;
  criteria: ReviewCriteria;
  rating: number;
  content: string;
  images: string[];
  helpful_count: number;
  merchant_reply?: string;
  merchant_reply_at?: string;
  is_anonymous: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface ReviewStats {
  star_distribution: { _id: number; count: number }[];
  criteria_averages: {
    cleanliness: number;
    service: number;
    location: number;
    price: number;
  }[];
  sentiment_count: {
    positive: number;
    negative: number;
    neutral: number;
  }[];
}

export interface CreateReviewPayload {
  place_id: string;
  cleanliness: number;
  service: number;
  location: number;
  price: number;
  content: string;
  images?: string[];
  is_anonymous?: boolean;
}