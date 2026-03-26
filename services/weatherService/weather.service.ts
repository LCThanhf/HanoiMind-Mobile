import axios from 'axios';
import { OpenWeatherCurrent, OpenWeatherCurrentApiResponse } from './weather.type';

const OPEN_WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPEN_WEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

const normalizeCurrentWeather = (payload: OpenWeatherCurrentApiResponse): OpenWeatherCurrent => {
  const condition = payload.weather?.[0];

  return {
    cityName: payload.name,
    country: payload.sys?.country || 'VN',
    temperature: payload.main?.temp ?? 0,
    feelsLike: payload.main?.feels_like ?? 0,
    visibility: payload.visibility ?? 0,
    humidity: payload.main?.humidity ?? 0,
    windSpeed: payload.wind?.speed ?? 0,
    conditionMain: condition?.main || 'Unknown',
    description: condition?.description || 'Không có dữ liệu',
    icon: condition?.icon || '01d',
  };
};

export const WeatherService = {
  getCurrentWeatherByCity: async (city: string): Promise<OpenWeatherCurrent> => {
    if (!OPEN_WEATHER_API_KEY) {
      throw new Error('Missing EXPO_PUBLIC_OPENWEATHER_API_KEY in environment variables.');
    }

    const response = await axios.get<OpenWeatherCurrentApiResponse>(`${OPEN_WEATHER_BASE_URL}/weather`, {
      params: {
        q: city,
        appid: OPEN_WEATHER_API_KEY,
        units: 'metric',
        lang: 'vi',
      },
      timeout: 15000,
    });

    return normalizeCurrentWeather(response.data);
  },
};