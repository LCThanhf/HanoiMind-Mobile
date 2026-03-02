import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import { StarterScreen } from './components/StarterScreen';
import { AuthLayout } from './components/AuthLayout';
import { SignInScreen } from './components/SignInScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { HomeScreen } from './components/HomeScreen';

type AppState = 'starter' | 'auth' | 'home';

export default function App() {
  const [appState, setAppState] = useState<AppState>('starter');
  const [isSignIn, setIsSignIn] = useState(true);

  const renderContent = () => {
    switch (appState) {
      case 'starter':
        return (
          <StarterScreen
            onLoginPress={() => {
              setIsSignIn(true);
              setAppState('auth');
            }}
            onSignUpPress={() => {
              setIsSignIn(false);
              setAppState('auth');
            }}
          />
        );
      case 'home':
        return <HomeScreen onLogout={() => setAppState('starter')} />;
      case 'auth':
      default:
        return (
          <AuthLayout>
            {isSignIn ? (
              <SignInScreen
                onNavigateToSignUp={() => setIsSignIn(false)}
                onLogin={() => setAppState('home')}
              />
            ) : (
              <SignUpScreen
                onNavigateToSignIn={() => setIsSignIn(true)}
                onLogin={() => setAppState('home')}
              />
            )}
          </AuthLayout>
        );
    }
  };

  return (
    <SafeAreaProvider>
      {renderContent()}
      {appState !== 'starter' && (
        <TouchableOpacity
          className="absolute bottom-10 right-5 bg-black/70 px-4 py-2 rounded-full z-50 shadow-md"
          onPress={() => setAppState('starter')}
        >
          <Text className="text-white text-xs font-bold">🛠 Debug: Starter</Text>
        </TouchableOpacity>
      )}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
