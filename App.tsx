import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import { StarterScreen } from './components/StarterScreen';
import { SignInScreen } from './components/SignInScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { HomeScreen } from './components/HomeScreen';
import { CreateTripScreen } from './components/CreateTripScreen';
import { TripDetailScreen } from './components/TripDetailScreen';
import { ProfileScreen } from './components/ProfileScreen';

type AppState = 'starter' | 'auth' | 'home' | 'createTrip' | 'tripDetail' | 'profile';

export default function App() {
  const [appState, setAppState] = useState<AppState>('starter');
  const [isSignIn, setIsSignIn] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string>('');

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
        return (
          <HomeScreen
            onOpenProfile={() => setAppState('profile')}
            onCreateTrip={() => setAppState('createTrip')}
            onTripClick={(tripId) => {
              setSelectedTripId(tripId);
              setAppState('tripDetail');
            }}
          />
        );
      case 'createTrip':
        return <CreateTripScreen onClose={() => setAppState('home')} />;
      case 'tripDetail':
        return <TripDetailScreen tripId={selectedTripId} onBack={() => setAppState('home')} />;
      case 'profile':
        return (
          <ProfileScreen
            onBack={() => setAppState('home')}
            onNavigateHome={() => setAppState('home')}
            onLogout={() => setAppState('starter')}
          />
        );
      case 'auth':
      default:
        return isSignIn ? (
          <SignInScreen
            onNavigateToSignUp={() => setIsSignIn(false)}
            onBack={() => setAppState('starter')}
            onLogin={() => setAppState('home')}
          />
        ) : (
          <SignUpScreen
            onNavigateToSignIn={() => setIsSignIn(true)}
            onBack={() => setAppState('starter')}
            onSignUp={() => setAppState('home')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      {renderContent()}
      <StatusBar style={appState === 'starter' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
