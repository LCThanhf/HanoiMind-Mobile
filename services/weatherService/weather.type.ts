export interface OpenWeatherCurrent {
  cityName: string;
  country: string;
  temperature: number;
  feelsLike: number;
  visibility: number;
  humidity: number;
  windSpeed: number;
  conditionMain: string;
  description: string;
  icon: string;
}

interface OpenWeatherCondition {
  main: string;
  description: string;
  icon: string;
}

export interface OpenWeatherCurrentApiResponse {
  name: string;
  visibility?: number;
  weather: OpenWeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}