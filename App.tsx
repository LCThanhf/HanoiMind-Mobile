import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import { AuthLayout } from './components/AuthLayout';
import { SignInScreen } from './components/SignInScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { HomeScreen } from './components/HomeScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <SafeAreaProvider>
      {isAuthenticated ? (
        <HomeScreen onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AuthLayout>
          {isSignIn ? (
            <SignInScreen
              onNavigateToSignUp={() => setIsSignIn(false)}
              onLogin={() => setIsAuthenticated(true)}
            />
          ) : (
            <SignUpScreen
              onNavigateToSignIn={() => setIsSignIn(true)}
              onLogin={() => setIsAuthenticated(true)}
            />
          )}
        </AuthLayout>
      )}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
