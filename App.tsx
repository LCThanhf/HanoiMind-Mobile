import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import { StarterScreen } from './components/StarterScreen';
import { SignInScreen } from './components/SignInScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { HomeScreen } from './components/HomeScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { PlacesExploreScreen } from './components/PlacesExploreScreen';
import { CreateTripScreen } from './components/CreateTripScreen';
import { TripDetailScreen } from './components/TripDetailScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TripsScreen } from './components/TripsScreen';
import { MainTab } from './components/BottomTabBar';
import { PlaceDetailScreen } from './components/PlaceDetailScreen';
import { ReviewScreen } from './components/ReviewScreen';

type AppState = 'starter' | 'auth' | 'main' | 'createTrip' | 'tripDetail' | 'placesExplore' | 'placeDetail' | 'reviewPlace';

export default function App() {
  const [appState, setAppState] = useState<AppState>('starter');
  // State lưu màn hình trước đó để quay lại đúng chỗ khi bấm back từ PlaceDetail
  const [previousState, setPreviousState] = useState<AppState>('main');

  const [isSignIn, setIsSignIn] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [homeTripTab, setHomeTripTab] = useState<'personal' | 'group'>('personal');

  const renderMainContent = () => {
    if (activeTab === 'profile') {
      return (
        <ProfileScreen
          activeTab={activeTab}
          onLogout={() => setAppState('starter')}
          onOpenProfile={() => setActiveTab('profile')}
          onTabChange={setActiveTab}
        />
      );
    }

    if (activeTab === 'explore') {
      return (
        <ExploreScreen
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onViewAllPlaces={() => {
            setPreviousState('main');
            setAppState('placesExplore');
          }}
          onOpenProfile={() => setActiveTab('profile')}
          onLogout={() => setAppState('starter')}
          onPlaceClick={(placeId: string) => {
            setSelectedPlaceId(placeId);
            setPreviousState('main'); // Đang ở main (Explore) -> xem detail -> bấm back về lại main
            setAppState('placeDetail');
          }}
        />
      );
    }

    if (activeTab === 'trips') {
      return (
        <TripsScreen
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCreateTrip={() => setAppState('createTrip')}
          onTripClick={(tripId) => {
            setSelectedTripId(tripId);
            setAppState('tripDetail');
          }}
          onOpenProfile={() => setActiveTab('profile')}
          onLogout={() => setAppState('starter')}
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
        return (
          <TripDetailScreen
            tripId={selectedTripId}
            onBack={() => setAppState('main')}
            onOpenProfile={() => { setActiveTab('profile'); setAppState('main'); }}
          />
        );

      case 'placesExplore':
        return (
          <PlacesExploreScreen
            onBack={() => setAppState('main')}
            activeTab={activeTab}
            onTabChange={(tab: any) => {
              setActiveTab(tab);
              setAppState('main');
            }}
            onPlaceClick={(placeId: string) => {
              setSelectedPlaceId(placeId);
              setPreviousState('placesExplore'); // Đang ở danh sách tất cả -> xem detail -> bấm back về danh sách
              setAppState('placeDetail');
            }}
          />
        );

      case 'placeDetail':
        return (
          <PlaceDetailScreen
            placeId={selectedPlaceId}
            onBack={() => setAppState(previousState)} // Quay về màn hình đã lưu trong state
            onReview={() => setAppState('reviewPlace')}
          />
        );

      case 'reviewPlace':
        return (
          <ReviewScreen
            placeId={selectedPlaceId}
            onBack={() => setAppState('placeDetail')}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setAppState('main');
            }}
          />
        );

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