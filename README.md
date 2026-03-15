# HanoiMind Mobile

A React Native / Expo mobile application for travel planning in Hanoi.

## Requirements

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/LCThanhf/HanoiMind-Mobile.git
cd HanoiMind-Mobile
```

> **Note:** Make sure you run `npm install` from inside the cloned `HanoiMind-Mobile` directory (not from a different folder). If you see an error like `Could not read package.json`, you are likely in the wrong directory.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

Then use the [Expo Go](https://expo.dev/go) app on your iOS or Android device to scan the QR code, or press `a` to open in an Android emulator / `i` for an iOS simulator.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the Expo development server |
| `npm run android` | Open the app in an Android emulator |
| `npm run ios` | Open the app in an iOS simulator |
| `npm run web` | Open the app in a web browser |
| `npm run lint` | Run ESLint and Prettier checks |
| `npm run format` | Auto-fix lint and formatting issues |

## Tech Stack

- [Expo](https://expo.dev/) (SDK 54)
- [React Native](https://reactnative.dev/) (0.81)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- [TypeScript](https://www.typescriptlang.org/)
