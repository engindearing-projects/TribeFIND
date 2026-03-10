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

// Mock supabase with proper chainable methods for MapScreen queries
jest.mock('../../lib/supabase', () => {
  const chainable = () => {
    const obj: any = {
      select: jest.fn(() => obj),
      insert: jest.fn(() => obj),
      update: jest.fn(() => obj),
      delete: jest.fn(() => obj),
      eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      neq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      order: jest.fn(() => obj),
      gte: jest.fn(() => obj),
      lte: jest.fn(() => obj),
    };
    return obj;
  };
  return {
    supabase: {
      from: jest.fn(() => chainable()),
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
      })),
      removeChannel: jest.fn(),
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
    },
  };
});

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
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loading state initially', () => {
    const { getByText } = renderWithProviders(<MapScreen />);

    expect(getByText('Finding your tribe...')).toBeTruthy();
  });

  it('renders the map after loading completes', async () => {
    jest.useRealTimers();
    const { queryByText } = renderWithProviders(<MapScreen />);

    await waitFor(
      () => {
        expect(queryByText('Finding your tribe...')).toBeNull();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it('renders activity filter after loading', async () => {
    jest.useRealTimers();
    const { getByText, queryByText } = renderWithProviders(<MapScreen />);

    await waitFor(
      () => {
        expect(queryByText('Finding your tribe...')).toBeNull();
      },
      { timeout: 10000 }
    );

    expect(getByText('ActivityFilter')).toBeTruthy();
  }, 15000);

  it('renders status indicators after loading', async () => {
    jest.useRealTimers();
    const { getByText, queryByText } = renderWithProviders(<MapScreen />);

    await waitFor(
      () => {
        expect(queryByText('Finding your tribe...')).toBeNull();
      },
      { timeout: 10000 }
    );

    expect(getByText('Real-time Updates')).toBeTruthy();
  }, 15000);
});
