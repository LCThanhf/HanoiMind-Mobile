export default {
  "expo": {
    "name": "hanoimind",
    "slug": "hanoimind",
    "version": "1.0.0",
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "experiments": {
      "tsconfigPaths": true
    },
    "plugins": [
      // SỬA TẠI ĐÂY: Bọc tên plugin và cấu hình vào trong một mảng []
      [
        "expo-barcode-scanner",
        {
          "barcodeScannerSettings": {
            "barcodeTypes": ["qr"]
          }
        }
      ]
    ],
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "config": {
        "googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.anonymous.myexpoapp", // Lưu ý: Đổi tên package này khi publish
      "config": {
        "googleMaps": {
          "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA" // Nên thêm quyền CAMERA cho tính năng quét mã QR
      ]
    }
  }
};