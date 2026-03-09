import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  BasicLocationExample,
  UpdateLocationExample,
  LocationTrackingExample,
  NearbyTribeMembersExample,
} from '../locationServiceUsage';
import locationService from '../../services/locationService';

// Mock locationService methods
jest.mock('../../services/locationService', () => ({
  __esModule: true,
  default: {
    requestLocationPermission: jest.fn(() => Promise.resolve({ granted: true })),
    getCurrentLocation: jest.fn(() =>
      Promise.resolve({
        location: { latitude: 34.052235, longitude: -118.243683, accuracy: 5, timestamp: Date.now() },
      })
    ),
    updateUserLocation: jest.fn(() => Promise.resolve({ success: true })),
    startLocationTracking: jest.fn((userId, options) => {
      // Immediately call onLocationUpdate for testing purposes
      options.onLocationUpdate(
        { latitude: 34.052235, longitude: -118.243683, accuracy: 5, timestamp: Date.now() },
        { success: true }
      );
      return Promise.resolve({ success: true });
    }),
    stopLocationTracking: jest.fn(),
    getNearbyTribeMembers: jest.fn(() => Promise.resolve({ users: [{ id: 'user1', username: 'TribeMember1' }], error: null })),
  },
}));

// Mock AuthService (already created in src/services/__mocks__/AuthService.js)
jest.mock('../../services/AuthService');

describe('BasicLocationExample', () => {
  it('renders correctly and requests location', async () => {
    const { getByText } = render(<BasicLocationExample />);
    expect(getByText('Get Current Location')).toBeTruthy();
    fireEvent.press(getByText('Request Location'));
    await waitFor(() => expect(locationService.requestLocationPermission).toHaveBeenCalled());
    await waitFor(() => expect(locationService.getCurrentLocation).toHaveBeenCalled());
    expect(getByText(/Latitude:/)).toBeTruthy();
  });
});

describe('UpdateLocationExample', () => {
  it('renders correctly and updates location', async () => {
    const { getByText } = render(<UpdateLocationExample />);
    expect(getByText('Update My Location')).toBeTruthy();
    fireEvent.press(getByText('Update Location in TribeFind'));
    await waitFor(() => expect(locationService.getCurrentLocation).toHaveBeenCalled());
    await waitFor(() => expect(locationService.updateUserLocation).toHaveBeenCalledWith(
      'mock-user-id',
      expect.any(Object)
    ));
    expect(getByText(/Last updated:/)).toBeTruthy();
  });
});

describe('LocationTrackingExample', () => {
  it('renders correctly and starts/stops tracking', async () => {
    const { getByText } = render(<LocationTrackingExample />);
    expect(getByText('Location Tracking')).toBeTruthy();
    fireEvent.press(getByText('Start Tracking'));
    await waitFor(() => expect(locationService.startLocationTracking).toHaveBeenCalled());
    expect(getByText('Stop Tracking')).toBeTruthy();
    fireEvent.press(getByText('Stop Tracking'));
    await waitFor(() => expect(locationService.stopLocationTracking).toHaveBeenCalled());
  });
});

describe('NearbyTribeMembersExample', () => {
  it('renders correctly and finds nearby members', async () => {
    const { getByText } = render(<NearbyTribeMembersExample />);
    expect(getByText('Find Nearby Tribe Members')).toBeTruthy();
    fireEvent.press(getByText('Find Tribe Members (5km)'));
    await waitFor(() => expect(locationService.getCurrentLocation).toHaveBeenCalled());
    await waitFor(() => expect(locationService.getNearbyTribeMembers).toHaveBeenCalledWith(
      expect.any(Object),
      5
    ));
    expect(getByText('Nearby Tribe Members:')).toBeTruthy();
    expect(getByText('TribeMember1')).toBeTruthy();
  });
});
