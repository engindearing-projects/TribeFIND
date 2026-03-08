import React from 'react';
import { waitFor } from '@testing-library/react-native';
import MapScreen from '../../screens/MapScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock locationService
jest.mock('../../src/services/locationService', () => ({
  __esModule: true,
  default: {
    requestLocationPermission: jest.fn().mockResolvedValue({ granted: true }),
    getCurrentLocation: jest.fn().mockResolvedValue({
      location: { latitude: 37.7749, longitude: -122.4194 },
      error: null,
    }),
    updateUserLocation: jest.fn().mockResolvedValue(null),
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

// Mock ActivityFilter component
jest.mock('../../components/ActivityFilter', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(Text, null, 'ActivityFilter'),
  };
});

describe('MapScreen', () => {
  it('shows loading state initially', () => {
    const { getByText } = renderWithProviders(<MapScreen />);

    expect(getByText('Finding your tribe...')).toBeTruthy();
  });

  it('renders the map after loading completes', async () => {
    const { queryByText } = renderWithProviders(<MapScreen />);

    await waitFor(
      () => {
        expect(queryByText('Finding your tribe...')).toBeNull();
      },
      { timeout: 5000 }
    );
  });

  it('renders activity filter after loading', async () => {
    const { getByText, queryByText } = renderWithProviders(<MapScreen />);

    await waitFor(
      () => {
        expect(queryByText('Finding your tribe...')).toBeNull();
      },
      { timeout: 5000 }
    );

    expect(getByText('ActivityFilter')).toBeTruthy();
  });

  it('renders status indicators after loading', async () => {
    const { getByText, queryByText } = renderWithProviders(<MapScreen />);

    await waitFor(
      () => {
        expect(queryByText('Finding your tribe...')).toBeNull();
      },
      { timeout: 5000 }
    );

    expect(getByText('Real-time Updates')).toBeTruthy();
  });
});
