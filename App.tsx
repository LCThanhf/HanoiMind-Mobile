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
import { MapScreen } from './components/MapScreen'; // Thêm Import MapScreen vào đây
import { ForumScreen } from './components/Forum/ForumScreen';

// 1. Thêm 'mapScreen' vào AppState
type AppState = 'starter' | 'auth' | 'main' | 'createTrip' | 'tripDetail' | 'placesExplore' | 'placeDetail' | 'reviewPlace' | 'mapScreen' | 'forum';

export default function App() {
  const [appState, setAppState] = useState<AppState>('starter');
  const [previousState, setPreviousState] = useState<AppState>('main');

  const [isSignIn, setIsSignIn] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');

  // State lưu ID để gọi API trong PlaceDetailScreen
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');

  // 2. State MỚI: Lưu toàn bộ object place để ném sang MapScreen (tránh phải gọi API lại 2 lần)
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [placeDetailRefreshKey, setPlaceDetailRefreshKey] = useState(0);
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
            setPreviousState('main');
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
        //initialTripTab={homeTripTab}
        //onTripTabChange={setHomeTripTab}
        onTripClick={(tripId) => {
          setSelectedTripId(tripId);
          setAppState('tripDetail');
        }}
        onOpenForum={() => setAppState('forum')}
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
        return (
          <TripDetailScreen
            tripId={selectedTripId}
            onBack={() => setAppState('main')}
            onOpenProfile={() => { setActiveTab('profile'); setAppState('main'); }}
          />
        );
          <CreateTripScreen
            onClose={() => setAppState('main')}
            onJourneyCreated={(journeyId) => {
              setSelectedTripId(journeyId);
              setAppState('tripDetail');
            }}
          />
        );
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
              setPreviousState('placesExplore');
              setAppState('placeDetail');
            }}
          />
        );

      case 'placeDetail':
        return (
          <PlaceDetailScreen
            placeId={selectedPlaceId}
            onBack={() => setAppState(previousState)}
            onReview={() => setAppState('reviewPlace')}
            refreshKey={placeDetailRefreshKey}
          />
        );

            // 3. Xử lý sự kiện mở bản đồ
            onOpenMap={(place) => {
              setSelectedPlaceData(place); // Lưu data vào state
              setAppState('mapScreen');    // Chuyển sang màn hình map
            }}
          />
        );

      // 4. Khai báo màn hình MapScreen
      case 'mapScreen':
        return (
          <MapScreen
            place={selectedPlaceData}
            onBack={() => setAppState('placeDetail')} // Bấm back trên Map sẽ về lại PlaceDetail
          />
        );

      case 'forum':
        return <ForumScreen onBack={() => setAppState('main')} />;

      case 'reviewPlace':
        return (
          <ReviewScreen
            placeId={selectedPlaceId}
            onBack={() => setAppState('placeDetail')}
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