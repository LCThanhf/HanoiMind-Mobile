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
    "plugins": [],
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
        // Sử dụng biến môi trường hợp lệ trong file .js
        "googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.anonymous.myexpoapp",
      "config": {
        "googleMaps": {
          // Sử dụng biến môi trường hợp lệ trong file .js
          "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
};