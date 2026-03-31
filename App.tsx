import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
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
import { MainTab, BottomTabBar } from './components/BottomTabBar';
import { PlaceDetailScreen } from './components/PlaceDetailScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { MapScreen } from './components/MapScreen';
import { NotificationScreen } from './components/NotificationScreen';
import ForumScreen from './components/Forum/ForumScreen';
import { ChatListScreen } from './components/chat/ChatListScreen';
import { ChatDetailScreen } from './components/chat/ChatDetailScreen';
import { ChatSettingsScreen } from './components/chat/ChatSettingScreen';
import { TripItineraryManageScreen } from './components/TripItineraryManageScreen';
import { TripAddPlaceScreen } from './components/TripAddPlaceScreen';
import { TripRouteScreen } from './components/TripRouteScreen';
import { TripBudgetManageScreen, MemberProfile, StopCostItem } from './components/TripBudgetManageScreen';
import { TripUpdateCostScreen } from './components/TripUpdateCostScreen';
import { Place } from './services/placeService/place.type';

type AppState =
  | 'starter'
  | 'auth'
  | 'main'
  | 'createTrip'
  | 'tripDetail'
  | 'tripManageDetail'
  | 'tripAddPlace'
  | 'tripRoute'
  | 'tripBudgetManage'
  | 'tripUpdateCost'
  | 'placesExplore'
  | 'placeDetail'
  | 'reviewPlace'
  | 'mapScreen'
  | 'notifications'
  | 'forum'
  | 'chatDetail'
  | 'chatSettings';

export default function App() {
  const [appState, setAppState] = useState<AppState>('starter');
  const [previousState, setPreviousState] = useState<AppState>('main');

  const [isSignIn, setIsSignIn] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedTripDayNumber, setSelectedTripDayNumber] = useState<number>(1);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [selectedPlaceData, setSelectedPlaceData] = useState<Place | null>(null);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>('');
  const [selectedChatName, setSelectedChatName] = useState<string>('');
  const [selectedStopForUpdate, setSelectedStopForUpdate] = useState<StopCostItem | null>(null);
  const [membersForUpdate, setMembersForUpdate] = useState<MemberProfile[]>([]);
  const [perStopEstimatedForUpdate, setPerStopEstimatedForUpdate] = useState(0);

  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [placeDetailRefreshKey, setPlaceDetailRefreshKey] = useState(0);

  const shouldShowBottomTabBar =
    appState === 'main' ||
    appState === 'placesExplore' ||
    appState === 'reviewPlace' ||
    appState === 'notifications' ||
    appState === 'tripManageDetail' ||
    appState === 'tripDetail';

  const handleBottomTabPress = (tab: MainTab) => {
    setActiveTab(tab);
    setAppState('main');
  };

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
          onTabChange={setActiveTab} onViewForum={() => setAppState('forum')}
          onViewAllPlaces={() => {
            setPreviousState('main');
            setAppState('placesExplore');
          }}
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
          onOpenNotifications={() => setAppState('notifications')}
        />
      );
    }

    if (activeTab === 'chat') {
      return (
        <ChatListScreen
          onChatClick={(roomId, chatName) => {
            setSelectedChatRoomId(roomId);
            setSelectedChatName(chatName);
            setPreviousState('main');
            setAppState('chatDetail');
          }}
        />
      );
    }

    return (
      <HomeScreen
        activeNavTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfile={() => setActiveTab('profile')}
        onCreateTrip={() => setAppState('createTrip')}
        onViewAllPlaces={() => {
          setPreviousState('main');
          setAppState('placesExplore');
        }}
        onPlaceClick={(placeId) => {
          setSelectedPlaceId(placeId);
          setPreviousState('main');
          setAppState('placeDetail');
        }}
        onLogout={() => setAppState('starter')}
        onOpenNotifications={() => setAppState('notifications')}
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
          <CreateTripScreen
            onClose={() => setAppState('main')}
            onJourneyCreated={(journeyId: string) => {
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
            onOpenProfile={() => {
              setActiveTab('profile');
              setAppState('main');
            }}
            onViewDetail={() => setAppState('tripManageDetail')}
          />
        );

      case 'tripManageDetail':
        return (
          <TripItineraryManageScreen
            tripId={selectedTripId}
            onBack={() => setAppState('tripDetail')}
            onOpenTripRoute={() => setAppState('tripRoute')}
            onOpenBudgetManage={() => setAppState('tripBudgetManage')}
            onAddPlace={(dayNumber) => {
              setSelectedTripDayNumber(dayNumber);
              setAppState('tripAddPlace');
            }}
            onOpenPlaceDetail={(placeId) => {
              setSelectedPlaceId(placeId);
              setPreviousState('tripManageDetail');
              setAppState('placeDetail');
            }}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setAppState('main');
            }}
          />
        );

      case 'tripAddPlace':
        return (
          <TripAddPlaceScreen
            tripId={selectedTripId}
            dayNumber={selectedTripDayNumber}
            onBack={() => setAppState('tripManageDetail')}
            onPlaceAdded={() => setAppState('tripManageDetail')}
          />
        );

      case 'tripRoute':
        return <TripRouteScreen tripId={selectedTripId} onBack={() => setAppState('tripManageDetail')} />;

      case 'tripBudgetManage':
        return (
          <TripBudgetManageScreen
            tripId={selectedTripId}
            onBack={() => setAppState('tripManageDetail')}
            onUpdateStop={(stop, members, perStopEstimated) => {
              setSelectedStopForUpdate(stop);
              setMembersForUpdate(members);
              setPerStopEstimatedForUpdate(perStopEstimated);
              setAppState('tripUpdateCost');
            }}
          />
        );

      case 'tripUpdateCost':
        return selectedStopForUpdate ? (
          <TripUpdateCostScreen
            tripId={selectedTripId}
            stop={selectedStopForUpdate}
            members={membersForUpdate}
            perStopEstimated={perStopEstimatedForUpdate}
            onBack={() => setAppState('tripBudgetManage')}
            onSaved={() => {
              setSelectedStopForUpdate(null);
              setAppState('tripBudgetManage');
            }}
          />
        ) : null;

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
            onOpenMap={(place) => {
              setSelectedPlaceData(place);
              setAppState('mapScreen');
            }}
            refreshKey={placeDetailRefreshKey}
          />
        );

      case 'mapScreen':
        return <MapScreen place={selectedPlaceData} onBack={() => setAppState('placeDetail')} />;

      case 'chatDetail':
        return (
          <ChatDetailScreen
            roomId={selectedChatRoomId}
            chatName={selectedChatName}
            onBack={() => {
              setActiveTab('chat');
              setAppState('main');
            }}
            onOpenSettings={() => setAppState('chatSettings')}
          />
        );

      case 'chatSettings':
        return (
          <ChatSettingsScreen
            roomId={selectedChatRoomId}
            chatName={selectedChatName}
            onBack={() => setAppState('chatDetail')}
          />
        );

      case 'forum':
        return <ForumScreen onBack={() => setAppState('main')} />;

      case 'reviewPlace':
        return (
          <ReviewScreen
            placeId={selectedPlaceId}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setAppState('main');
            }}
            onBack={() => {
              setPlaceDetailRefreshKey((value) => value + 1);
              setAppState('placeDetail');
            }}
          />
        );

      case 'notifications':
        return (
          <NotificationScreen
            activeTab={activeTab}
            onBack={() => setAppState('main')}
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1 }}>
      {renderContent()}
      {shouldShowBottomTabBar && (
        <BottomTabBar activeTab={activeTab} onTabPress={handleBottomTabPress} />
      )}
      <StatusBar style={appState === 'starter' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}