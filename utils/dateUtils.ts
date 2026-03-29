import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import tiếng Việt

// Thiết lập tiếng Việt làm mặc định
dayjs.locale('vi');

export const DateUtils = {
  /**
   * Format: 14:30, 21-03-2026
   */
  formatDateTime: (date: string | Date) => {
    if (!date) return '---';
    return dayjs(date).format('HH:mm, DD-MM-YYYY');
  },

  formatOnlyDate: (date: string | Date) => {
    if (!date) return '---';
    return dayjs(date).format('DD/MM/YYYY');
  },

  /**
   * Kiểu "vài phút trước", "2 giờ trước" giống như bản Figma
   */
  formatFromNow: (date: string | Date) => {
    if (!date) return '---';
    // Cần import thêm relativeTime plugin nếu muốn dùng .fromNow()
    // Nhưng đơn giản nhất là dùng format chuẩn như trên cho chuyên nghiệp
    return dayjs(date).format('HH:mm - DD/MM');
  }
};