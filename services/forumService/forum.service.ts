import apiClient from '../apiClient';
import { 
  ForumPost, 
  ForumComment, 
  CreatePostPayload, 
  PostSearchFilter,
  ReportReason
} from './forum.type';

const normalizeForumListResponse = (payload: unknown): { data: ForumPost[]; meta: any } => {
  if (Array.isArray(payload)) {
    return { data: payload as ForumPost[], meta: null };
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return {
        data: record.data as ForumPost[],
        meta: record.meta ?? null,
      };
    }

    if (Array.isArray(record.items)) {
      return {
        data: record.items as ForumPost[],
        meta: record.meta ?? null,
      };
    }
  }

  return { data: [], meta: null };
};

export const ForumService = {
  /**
   * 1. Lấy danh sách bài viết (Có lọc, phân trang)
   */
  findAll: async (filter: PostSearchFilter): Promise<{ data: ForumPost[]; meta: any }> => {
    try {
      const payload = await apiClient.get('/forum/posts', { params: filter });
      return normalizeForumListResponse(payload);
    } catch (error) { throw error; }
  },

  /**
   * 2. Lấy chi tiết bài viết (Kèm bình luận & tóm tắt hành trình)
   */
  getPostDetail: async (id: string): Promise<ForumPost & { comments: ForumComment[], journey_summary?: any }> => {
    try {
      return await apiClient.get(`/forum/posts/${id}`);
    } catch (error) { throw error; }
  },

  /**
   * 3. Tạo bài viết mới
   */
  createPost: async (payload: CreatePostPayload): Promise<ForumPost> => {
    try {
      return await apiClient.post('/forum/posts', payload);
    } catch (error) { throw error; }
  },

  /**
   * 4. Thích/Bỏ thích bài viết
   */
  toggleLike: async (id: string): Promise<ForumPost> => {
    try {
      return await apiClient.patch(`/forum/posts/${id}/like`);
    } catch (error) { throw error; }
  },

  /**
   * 5. Gửi bình luận
   */
  addComment: async (postId: string, content: string, parentId?: string): Promise<ForumComment> => {
    try {
      return await apiClient.post(`/forum/posts/${postId}/comments`, { 
        content, 
        parent_id: parentId 
      });
    } catch (error) { throw error; }
  },

  /**
   * 6. Báo cáo bài viết vi phạm
   */
  reportPost: async (postId: string, reason: ReportReason, description?: string): Promise<any> => {
    try {
      return await apiClient.post(`/forum/posts/${postId}/report`, { 
        reason, 
        description 
      });
    } catch (error) { throw error; }
  },

  /**
   * 7. Xóa bài viết
   */
  deletePost: async (id: string): Promise<any> => {
    try {
      return await apiClient.delete(`/forum/forum/posts/${id}`);
    } catch (error) { throw error; }
  }

  
};