import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import { AuthLayout } from './components/AuthLayout';
import { SignInScreen } from './components/SignInScreen';
import { SignUpScreen } from './components/SignUpScreen';

export default function App() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <SafeAreaProvider>
      <AuthLayout>
        {isSignIn ? (
          <SignInScreen onNavigateToSignUp={() => setIsSignIn(false)} />
        ) : (
          <SignUpScreen onNavigateToSignIn={() => setIsSignIn(true)} />
        )}
      </AuthLayout>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
