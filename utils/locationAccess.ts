import * as Location from 'expo-location';
import { Linking } from 'react-native';

export type LocationAccessStatus =
  | 'granted'
  | 'permission-denied'
  | 'permission-blocked'
  | 'services-disabled'
  | 'location-error';

export interface LocationAccessResult {
  status: LocationAccessStatus;
  coords?: Location.LocationObjectCoords;
  error?: unknown;
}

export interface LocationPromptContent {
  title: string;
  message: string;
  primaryLabel: string;
}

const looksLikeServiceDisabledError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('location') &&
    (message.includes('disabled') || message.includes('unavailable') || message.includes('provider'))
  );
};

export const resolveCurrentLocation = async (
  positionOptions: Location.LocationOptions = {}
): Promise<LocationAccessResult> => {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    return {
      status: permission.canAskAgain ? 'permission-denied' : 'permission-blocked',
    };
  }

  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return { status: 'services-disabled' };
    }
  } catch {
    // Some devices may not support this check reliably.
  }

  try {
    const location = await Location.getCurrentPositionAsync(positionOptions);
    return {
      status: 'granted',
      coords: location.coords,
    };
  } catch (error) {
    return {
      status: looksLikeServiceDisabledError(error) ? 'services-disabled' : 'location-error',
      error,
    };
  }
};

export const getLocationPromptContent = (
  status: Exclude<LocationAccessStatus, 'granted'>
): LocationPromptContent => {
  switch (status) {
    case 'permission-denied':
      return {
        title: 'Cần quyền truy cập vị trí',
        message: 'Ứng dụng cần vị trí để hiển thị thông tin chính xác hơn. Vui lòng cho phép truy cập vị trí.',
        primaryLabel: 'Thử lại',
      };
    case 'permission-blocked':
      return {
        title: 'Quyền vị trí đang bị chặn',
        message: 'Bạn đã tắt quyền vị trí cho ứng dụng. Hãy mở Cài đặt để bật lại quyền truy cập vị trí.',
        primaryLabel: 'Tôi hiểu',
      };
    case 'services-disabled':
      return {
        title: 'Dịch vụ vị trí đang tắt',
        message: 'Thiết bị của bạn đang tắt GPS hoặc dịch vụ vị trí. Vui lòng bật lại để tiếp tục.',
        primaryLabel: 'Tôi đã bật',
      };
    default:
      return {
        title: 'Không thể lấy vị trí',
        message: 'Hiện chưa thể lấy vị trí của bạn. Vui lòng thử lại hoặc mở Cài đặt để kiểm tra quyền truy cập.',
        primaryLabel: 'Thử lại',
      };
  }
};

export const openLocationSettings = async (): Promise<boolean> => {
  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
};
