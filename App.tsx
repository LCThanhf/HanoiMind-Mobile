import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { View } from 'react-native'; // Thêm import View
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
import { MainTab, BottomTabBar } from './components/BottomTabBar'; // Thêm Import BottomTabBar
import { PlaceDetailScreen } from './components/PlaceDetailScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { MapScreen } from './components/MapScreen'; // Thêm Import MapScreen vào đây
import { ForumScreen } from './components/Forum/ForumScreen';
import { ChatListScreen } from './components/chat/ChatListScreen';
import { ChatDetailScreen } from './components/chat/ChatDetailScreen'; // Thêm Import ChatDetailScreen
import { ChatSettingsScreen } from './components/chat/ChatSettingScreen'; // Thêm Import ChatSettingsScreen
// 1. Thêm 'mapScreen' vào AppState
type AppState = 'starter' | 'auth' | 'main' | 'createTrip' | 'tripDetail' | 'placesExplore' | 'placeDetail' | 'reviewPlace' | 'mapScreen' | 'forum' | 'chatDetail' | 'chatSettings';

export default function App() {
  const [appState, setAppState] = useState<AppState>('starter');
  const [previousState, setPreviousState] = useState<AppState>('main');

  const [isSignIn, setIsSignIn] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string>('');

  // State lưu ID để gọi API trong PlaceDetailScreen
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(''); 
  
  // State: Lưu toàn bộ object place để ném sang MapScreen (tránh phải gọi API lại 2 lần)
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);

  // 2. State MỚI: Lưu thông tin chat khi click vào 1 hội thoại
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>('');
  const [selectedChatName, setSelectedChatName] = useState<string>('');

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

    // 3. Xử lý render tab Chat
    if (activeTab === 'chat') {
      return (
        <View style={{ flex: 1 }}>
          <ChatListScreen 
            onChatClick={(roomId, chatName) => {
              setSelectedChatRoomId(roomId);
              setSelectedChatName(chatName);
              setPreviousState('main'); // Lưu lại state main để back về
              setAppState('chatDetail'); // Chuyển sang màn chi tiết Chat
            }}
          />
          {/* Cần render BottomTabBar ở đây vì ChatListScreen không chứa sẵn */}
          <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
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
            onOpenMap={(place) => {
              setSelectedPlaceData(place);
              setAppState('mapScreen');
            }}
          />
        );
        
      case 'mapScreen':
        return (
            <MapScreen 
                place={selectedPlaceData} 
                onBack={() => setAppState('placeDetail')} 
            />
        );

      // 4. Khai báo màn hình Chat Detail
      case 'chatDetail':
        return (
          <ChatDetailScreen 
            roomId={selectedChatRoomId}
            chatName={selectedChatName}
            onBack={() => setAppState('main')} 
            onOpenSettings={() => setAppState('chatSettings')}// Bấm back sẽ trở về List Chat
          />
        );
        case 'chatSettings':
        return (
          <ChatSettingsScreen 
            roomId={selectedChatRoomId}
            chatName={selectedChatName}
            onBack={() => setAppState('chatDetail')} // Back lại màn nhắn tin
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1 }}>
      {renderContent()}
      <StatusBar style={appState === 'starter' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}