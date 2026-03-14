import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMEOUT = 30000; 

const apiClient = axios.create({
    baseURL: 'https://sybausuzuka-berotravel-backend.hf.space/api/v1/',
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Thêm Interceptor cho Request (Trước khi gửi request đi)
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm Interceptor cho Response (Sau khi nhận kết quả trả về từ backend)
apiClient.interceptors.response.use(
    (response) => {
        // Kiểm tra an toàn trước khi bóc tách
        if (response.data && response.data.success) {
            return response.data.data; // Trả về object chứa tokens
        }
        return response.data;
    },
    (error) => {
        // Phải return Promise.reject để lỗi bắn về khối catch của Screen
        return Promise.reject(error);
    }
);

export default apiClient;