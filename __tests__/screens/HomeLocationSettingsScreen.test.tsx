import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import HomeLocationSettingsScreen from '../../screens/HomeLocationSettingsScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { home_location: null },
            error: null,
          }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

// Mock locationService
jest.mock('../../src/services/locationService', () => ({
  __esModule: true,
  default: {
    requestLocationPermission: jest.fn().mockResolvedValue({ granted: true }),
    getCurrentLocation: jest.fn().mockResolvedValue({
      error: false,
      location: { latitude: 37.7749, longitude: -122.4194 },
    }),
  },
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = React.forwardRef((props: any, ref: any) =>
    React.createElement(View, { ...props, ref, testID: 'map-view' })
  );
  MockMapView.displayName = 'MockMapView';
  return {
    __esModule: true,
    default: MockMapView,
    Marker: (props: any) => React.createElement(View, { ...props, testID: 'marker' }),
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
  useIsFocused: jest.fn().mockReturnValue(true),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HomeLocationSettingsScreen', () => {
  it('shows loading state initially', () => {
    const { getByText } = renderWithProviders(<HomeLocationSettingsScreen />);

    expect(getByText('Loading home location...')).toBeTruthy();
  });

  it('renders header after loading', async () => {
    const { getByText } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(getByText('Home Location')).toBeTruthy();
    });
  });

  it('renders subtitle text', async () => {
    const { getByText } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(
        getByText(
          'Set your home location for better activity recommendations and distance calculations.'
        )
      ).toBeTruthy();
    });
  });

  it('renders address and nickname inputs', async () => {
    const { getByPlaceholderText } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText('Enter your home address')).toBeTruthy();
      expect(
        getByPlaceholderText('e.g., My Apartment, Family House')
      ).toBeTruthy();
    });
  });

  it('renders map section', async () => {
    const { getByText, getByTestId } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(getByText('Location on Map')).toBeTruthy();
      expect(getByText('Tap on the map to set your exact home location')).toBeTruthy();
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });

  it('renders action buttons', async () => {
    const { getByText } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(getByText('📍 Use Current Location')).toBeTruthy();
      expect(getByText('Save Home Location')).toBeTruthy();
    });
  });

  it('allows typing in address input', async () => {
    const { getByPlaceholderText } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText('Enter your home address')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Enter your home address'), '123 Main St');
  });

  it('allows typing in nickname input', async () => {
    const { getByPlaceholderText } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText('e.g., My Apartment, Family House')).toBeTruthy();
    });

    fireEvent.changeText(
      getByPlaceholderText('e.g., My Apartment, Family House'),
      'My Place'
    );
  });

  it('renders input labels', async () => {
    const { getByText } = renderWithProviders(<HomeLocationSettingsScreen />);

    await waitFor(() => {
      expect(getByText('Address')).toBeTruthy();
      expect(getByText('Nickname (Optional)')).toBeTruthy();
    });
  });
});
