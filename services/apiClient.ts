import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sybausuzuka-berotravel-backend.hf.space/api/v1/';
const TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 300000; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Thêm Interceptor cho Request
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

// Thêm Interceptor cho Response (Bóc tách dữ liệu theo chuẩn Backend của bạn)
apiClient.interceptors.response.use(
    (response) => {
        // Trả về data bên trong nếu request thành công
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;