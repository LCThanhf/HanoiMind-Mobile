export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MERCHANT = 'MERCHANT',
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  birthday?: string;
  preferences?: string[];
  travelStyle?: string;
  createdAt: string;
}

export interface PublicProfile {
  _id: string;
  fullName: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  travelStyle?: string;
  role: UserRole;
  createdAt: string;
}

export interface TravelDNA {
  user_summary: {
    display_name: string;
    avatar_url: string;
    persona: string;
    catchphrase: string;
    activity_level: string;
    total_actions: number;
  };
  visual_data: {
    radar_chart: Array<{ category: string; value: number; color: string }>;
    dominant_color: string;
  };
  dna_details: {
    long_term_traits: Array<{ label: string; score_percentage: number }>;
    current_vibe: { title: string; vibe_tags: string[]; description: string };
  };
}

export interface MerchantRequestPayload {
  business_name: string;
  tax_code: string;
  address: string;
  phone_number: string;
}

export interface UserSearchResult {
  id: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  travelStyle?: string;
  role: string;
}