import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sybausuzuka-berotravel-backend.hf.space/api/v1/';

const normalizeApiBaseUrl = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return '';

    const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
    if (/\/api\/v1$/i.test(withoutTrailingSlash)) {
        return `${withoutTrailingSlash}/`;
    }

    return `${withoutTrailingSlash}/api/v1/`;
};

const AI_BASE_URL_RAW = process.env.EXPO_PUBLIC_AI_API_URL || '';
const AI_BASE_URL = normalizeApiBaseUrl(AI_BASE_URL_RAW);

if (!AI_BASE_URL_RAW) {
    console.warn('[apiClient] Missing EXPO_PUBLIC_AI_API_URL. AI requests must target a dedicated AI backend URL.');
}

const TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 300000;

const applyInterceptors = (client: ReturnType<typeof axios.create>) => {
    client.interceptors.request.use(
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

    client.interceptors.response.use(
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

    return client;
};

const createClient = (baseURL: string) =>
    applyInterceptors(
        axios.create({
            baseURL,
            timeout: TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        })
    );

const apiClient = createClient(BASE_URL);
export const aiApiClient = createClient(AI_BASE_URL);

export default apiClient;