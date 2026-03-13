import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../../store/authSlice';
import locationSlice from '../../store/locationSlice';
import privacySlice from '../../store/privacySlice';
import contactsSlice from '../../store/contactsSlice';
import messagingSlice from '../../store/messagingSlice';
import tutorialSlice from '../../store/tutorialSlice';
import storiesSlice from '../../store/storiesSlice';
import { AuthProvider } from '../../services/AuthService'; // Import AuthProvider

jest.mock('../../lib/supabase'); // Mock supabase for tests

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  avatar: '🧑',
  bio: 'Test bio',
  snap_score: 42,
  is_online: true,
  stats: {
    snaps_shared: 5,
    videos_shared: 2,
  },
  social_accounts: {},
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'test-user-id', email: 'test@example.com' },
};

export function createMockStore(overrides: any = {}) {
  const preloadedState = {
    auth: {
      user: mockUser,
      session: mockSession,
      loading: false,
      isAuthenticated: true,
      ...overrides.auth,
    },
    location: {
      currentLocation: null,
      isTracking: false,
      hasPermission: false,
      trackingAccuracy: 'medium' as const,
      updateInterval: 30000,
      locationHistory: [],
      backgroundTracking: false,
      ...overrides.location,
    },
    privacy: {
      shareLocation: true,
      privacyLevel: 'everyone' as const,
      ghostMode: { enabled: false },
      allowedContacts: [],
      blockedContacts: [],
      showPreciseLocation: true,
      shareLocationHistory: true,
      allowStrangerMessages: true,
      showOnlineStatus: true,
      notifications: {
        pushEnabled: true,
        locationUpdates: true,
        friendRequests: true,
        messages: true,
      },
      ...overrides.privacy,
    },
    contacts: {
      contacts: [],
      searchQuery: '',
      pendingRequests: [],
      blockedUsers: [],
      nearbyContacts: [],
      loadingContacts: false,
      contactUpdates: 0,
      ...overrides.contacts,
    },
    messaging: {
      chatRooms: [],
      messages: {},
      currentChatRoom: null,
      loadingMessages: false,
      loadingChatRooms: false,
      totalUnreadCount: 0,
      typingUsers: {},
      ...overrides.messaging,
    },
    tutorial: {
      hasCompletedOnboarding: false,
      lastCompletedStep: -1,
      tutorialVisible: false,
      firstTimeUser: true,
      ...overrides.tutorial,
    },
    stories: {
      storyGroups: [],
      myStories: [],
      loading: false,
      viewingGroupIndex: null,
      viewingStoryIndex: 0,
      ...overrides.stories,
    },
  };

  return configureStore({
    reducer: {
      auth: authSlice,
      location: locationSlice,
      privacy: privacySlice,
      contacts: contactsSlice,
      messaging: messagingSlice,
      tutorial: tutorialSlice,
      stories: storiesSlice,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  storeOverrides: any = {}
) {
  const store = createMockStore(storeOverrides);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <AuthProvider> {/* Add AuthProvider here */}
          {children}
        </AuthProvider>
      </Provider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper }),
    store,
  };
}
