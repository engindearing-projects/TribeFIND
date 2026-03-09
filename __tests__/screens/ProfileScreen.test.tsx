import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../screens/ProfileScreen';
import { renderWithProviders, mockUser } from '../helpers/renderWithProviders';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: {}, error: null }),
          // Mock head and count for photo/friends count
          head: jest.fn().mockResolvedValue({ count: 0, error: null }),
        })),
        // For select without eq (e.g., getting user data)
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      })),
    })),
  },
}));

// Mock AuthService
const mockSignOut = jest.fn().mockResolvedValue(null);
const mockLinkTwitterAccount = jest.fn().mockResolvedValue({ error: null });
const mockUpdateProfile = jest.fn().mockResolvedValue(null);

jest.mock('../../services/AuthService', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
    linkTwitterAccount: mockLinkTwitterAccount,
    updateProfile: mockUpdateProfile,
  }),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
  EncodingType: { Base64: 'base64' },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useIsFocused: jest.fn().mockReturnValue(true),
    useFocusEffect: jest.fn((callback) => {
      // Execute callback immediately in tests
      const cleanup = callback();
      return cleanup;
    }),
  };
});

// Mock navigation types
jest.mock('../../types/navigation', () => ({}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProfileScreen', () => {
  it('renders user profile information', async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText(mockUser.display_name)).toBeTruthy();
      expect(getByText(`@${mockUser.username}`)).toBeTruthy();
    });
  });

  it('renders user bio', async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText(mockUser.bio)).toBeTruthy();
    });
  });

  it('renders stats section', async () => {
    const { getByText, getAllByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Snaps')).toBeTruthy();
      expect(getAllByText('Friends').length).toBeGreaterThanOrEqual(1);
      expect(getByText('Score')).toBeTruthy();
    });
  });

  it('renders settings section', async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('Location Settings')).toBeTruthy();
      expect(getByText('Home Location')).toBeTruthy();
      expect(getByText('Activities & Interests')).toBeTruthy();
    });
  });

  it('renders sign out button', async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Sign Out')).toBeTruthy();
    });
  });

  it('calls signOut when sign out button is pressed', async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Sign Out')).toBeTruthy();
    });

    fireEvent.press(getByText('Sign Out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('renders connected accounts section', async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Connected Accounts')).toBeTruthy();
    });
  });

  it('renders no user state when user is null', () => {
    const { toJSON } = renderWithProviders(<ProfileScreen />, {
      auth: { user: null, session: null, loading: false, isAuthenticated: false },
    });

    // Should render null
    expect(toJSON()).toBeNull();
  });

  it('renders notification and friends settings', async () => {
    const { getAllByText, getByText } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getAllByText('Friends').length).toBeGreaterThanOrEqual(1);
      expect(getByText('Notifications')).toBeTruthy();
    });
  });
});
