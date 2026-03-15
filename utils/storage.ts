import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  // Lưu dữ liệu (tự động chuyển object sang string)
  setItem: async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Lỗi khi lưu dữ liệu:', e);
    }
  },

  // Đọc dữ liệu (tự động parse string sang object)
  getItem: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Lỗi khi đọc dữ liệu:', e);
      return null;
    }
  },

  // Xóa một key cụ thể (ví dụ khi Logout)
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Lỗi khi xóa dữ liệu:', e);
    }
  },

  // Xóa toàn bộ kho lưu trữ
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Lỗi khi xóa tất cả:', e);
    }
  },
};