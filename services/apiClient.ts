import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMEOUT = 600000; 

const apiClient = axios.create({
    baseURL: 'https://sybausuzuka-berotravel-backend.hf.space/api/v1',
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
        return response.data; 
    },
    (error) => {
        // Xử lý lỗi Timeout
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            console.error('Lỗi: Kết nối quá hạn.');
        }

        // Xử lý lỗi từ Server (VD: sai mật khẩu, email tồn tại...)
        if (error.response) {
            const serverMessage = error.response.data?.message || 'Có lỗi xảy ra từ server';
            console.error(`Backend Error (${error.response.status}):`, serverMessage);
            
            // Ví dụ: Nếu token hết hạn (401), có thể xóa token và yêu cầu login lại
            if (error.response.status === 401) {
                // AsyncStorage.removeItem('accessToken');
                // Redirect to Login
            }
        } else if (error.request) {
            console.error('Lỗi: Không thể kết nối đến server (Network Error).');
        }

        return Promise.reject(error);
    }
);

export default apiClient;