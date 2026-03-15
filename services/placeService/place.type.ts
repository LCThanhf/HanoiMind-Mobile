
export enum PlaceCategory {
  // LƯU TRÚ
  ACCOMMODATION = 'ACCOMMODATION', 
  HOTEL = 'HOTEL',
  HOSTEL = 'HOSTEL',
  HOMESTAY = 'HOMESTAY',
  RESORT = 'RESORT',
  GUEST_HOUSE = 'GUEST_HOUSE',
  // ĂN UỐNG
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  BAR_PUB = 'BAR_PUB',             // Nightlife: Bar, Pub, Club
  STREET_FOOD = 'STREET_FOOD',     // Đặc sản vỉa hè
  
  // KHÁM PHÁ & VĂN HÓA
  SIGHTSEEING = 'SIGHTSEEING',     // Địa danh, Di tích
  CULTURE = 'CULTURE',             // Bảo tàng, Nhà hát, Triển lãm
  PARK = 'PARK',                   // Công viên, Khu dã ngoại
  
  // TRẢI NGHIỆM & GIẢI TRÍ
  EXPERIENCE = 'EXPERIENCE',       // Workshop, Lớp học nấu ăn, Tour nội đô
  ENTERTAINMENT = 'ENTERTAINMENT', // Rạp phim, Khu vui chơi, Karaoke
  WELLNESS = 'WELLNESS',           // Spa, Massage, Yoga, Gym
  
  // MUA SẮM
  SHOPPING = 'SHOPPING',           // TTTM, Siêu thị
  LOCAL_MARKET = 'LOCAL_MARKET',   // Chợ địa phương, Cửa hàng lưu niệm
  
  // TIỆN ÍCH THIẾT YẾU
  TRANSPORT = 'TRANSPORT',         // Bến xe, Ga tàu, Sân bay, Cho thuê xe
  HEALTH = 'HEALTH',               // Bệnh viện, Hiệu thuốc
  FINANCE = 'FINANCE',             // ATM, Ngân hàng, Đổi tiền
  CONVENIENCE = 'CONVENIENCE',     // Cửa hàng tiện lợi 24/7 (Circle K, Mart)
  LAUNDRY = 'LAUNDRY',             // Giặt là (Khách du lịch cực cần)
  
  OTHER = 'OTHER'
}

export enum PlaceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Place {
  _id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  address: string;
  location: {
    type: string;
    coordinates: number[]; // [lng, lat]
  };
  images: string[];
  ownerId: string | null;
  rating: number;
  reviewCount: number;
  priceLevel?: number;
  crowdLevel: number;
  tags: string[];
  is_partner: boolean;
  status: PlaceStatus;
  openingHours?: {
    periods: any[];
    weekday_text: string[];
  };
  phoneNumber?: string;
  website?: string;
  favorites_count: number;
  amenities?: string[];
  createdBy: string;
  estimated_cost_vnd: number;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Chỉ có khi search theo tọa độ
}

export interface SearchPlaceParams {
  name?: string;
  category?: PlaceCategory;
  tags?: string; // Phân cách bằng dấu phẩy
  page?: number;
  limit?: number;
  lng?: number;
  lat?: number;
  radius?: number;
  sortBy?: 'rating' | 'distance' | 'createdAt' | 'crowdLevel';
  sortOrder?: 'ASC' | 'DESC';
  maxCrowd?: number;
}

export interface CreatePlacePayload {
  name: string;
  description: string;
  category: PlaceCategory;
  address: string;
  location: {
    lng: number;
    lat: number;
  };
  images: string[];
  tags?: string[];
  phoneNumber?: string;
  website?: string;
  crowdLevel?: number;
  amenities?: string[];
  openingHours?: any;
  estimated_cost_vnd?: number;
  is_owner?: boolean; // Dành cho Merchant muốn claim ngay khi tạo
}