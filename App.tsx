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
import { MainTab } from './components/BottomTabBar';

type AppState = 'starter' | 'auth' | 'main' | 'createTrip' | 'tripDetail';

export default function App() {
  const [appState, setAppState] = useState<AppState>('starter');
  const [isSignIn, setIsSignIn] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [homeTripTab, setHomeTripTab] = useState<'personal' | 'group'>('personal');

  const renderMainContent = () => {
    if (activeTab === 'profile') {
      return (
        <ProfileScreen
          activeTab={activeTab}
          onBack={() => setActiveTab('home')}
          onLogout={() => setAppState('starter')}
          onTabChange={setActiveTab}
        />
      );
    }

    return (
      <HomeScreen
        activeNavTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfile={() => setActiveTab('profile')}
        onCreateTrip={() => setAppState('createTrip')}
        onLogout={() => setAppState('starter')}
        initialTripTab={homeTripTab}
        onTripTabChange={setHomeTripTab}
        onTripClick={(tripId) => {
          setSelectedTripId(tripId);
          setAppState('tripDetail');
        }}
      />
    );
  };

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
      case 'main':
        return renderMainContent();
      case 'createTrip':
        return <CreateTripScreen onClose={() => setAppState('main')} />;
      case 'tripDetail':
        return <TripDetailScreen tripId={selectedTripId} onBack={() => setAppState('main')} onOpenProfile={() => { setActiveTab('profile'); setAppState('main'); }} />;
      case 'auth':
      default:
        return isSignIn ? (
          <SignInScreen
            onNavigateToSignUp={() => setIsSignIn(false)}
            onBack={() => setAppState('starter')}
            onLogin={() => {
              setActiveTab('home');
              setAppState('main');
            }}
          />
        ) : (
          <SignUpScreen
            onNavigateToSignIn={() => setIsSignIn(true)}
            onBack={() => setAppState('starter')}
            onSignUp={() => {
              setActiveTab('home');
              setAppState('main');
            }}
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
