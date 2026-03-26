export enum ForumCategory {   //loại bài viết trong diễn đàn
  REVIEW = 'REVIEW',
  EXPERIENCE = 'EXPERIENCE', // Kinh nghiệm phượt
  FIND_BUDDY = 'FIND_BUDDY', // Tìm bạn đồng hành
  QNA = 'QNA',               // Hỏi đáp
  OTHERS = 'OTHERS'
}

export enum PostStatus {  //trạng thái bài viết 
  DRAFT = 'DRAFT', //nháp 
  PUBLISHED = 'PUBLISHED',//công khai 
  HIDDEN = 'HIDDEN' 
}

export enum PostSortBy {
  LATEST = 'latest',
  POPULAR = 'popular',
  TRENDING = 'trending',
}

export enum ReportReason {
  SPAM = 'SPAM', 
  OFFENSIVE = 'OFFENSIVE', // xúc phạm 
  MISINFORMATION = 'MISINFORMATION', //thông tin sai lệch 
  HARASSMENT = 'HARASSMENT', //quấy rối 
  INAPPROPRIATE = 'INAPPROPRIATE', //ko phù hợp 
  SCAM = 'SCAM', //lừa đảo 
  OTHERS = 'OTHERS'
}

export interface AuthorMinified {
  id: string;
  fullName: string;
  avatar?: string;
}

export interface ForumPost {
  _id: string;
  title: string;
  content: string;
  images: string[];
  category: ForumCategory;
  tag: string[];
  place_ids: string[];
  journey_id?: string;
  stats: {
    likes: number;
    views: number;
    comments: number;
  };
  author: AuthorMinified;
  is_pinned: boolean;
  status: PostStatus;
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  _id: string;
  post_id: string;
  content: string;
  author: AuthorMinified;
  parent_id?: string;
  liked_by: string[];
  created_at: string;
}

// Payloads
export interface CreatePostPayload {
  title: string;
  content: string;
  category: ForumCategory;
  images?: string[];
  place_ids?: string[];
  journey_id?: string;
}

export interface PostSearchFilter {
  search?: string;
  category?: ForumCategory;
  place_id?: string;
  author_id?: string;
  tag_id?: string;
  sortBy?: PostSortBy;
  page?: number;
  limit?: number;
}