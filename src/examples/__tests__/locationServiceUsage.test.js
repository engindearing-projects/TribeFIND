import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, mockUser } from '../../../__tests__/helpers/renderWithProviders'; // Import renderWithProviders and mockUser
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
    getNearbyTribeMembers: jest.fn(() => Promise.resolve({ users: [{ id: 'user1', username: 'TribeMember1', display_name: 'TribeMember1' }], error: null })),
  },
}));

// The mock for AuthService is no longer explicitly needed here as renderWithProviders handles AuthProvider.
// If there are specific AuthService methods mocked in a separate file, they might still be needed.
// For now, I'll remove the explicit mock here to avoid conflicts or redundancy.
// jest.mock('../../services/AuthService');

describe('BasicLocationExample', () => {
  it('renders correctly and requests location', async () => {
    const { getByText } = renderWithProviders(<BasicLocationExample />);
    expect(getByText('Get Current Location')).toBeTruthy();
    fireEvent.press(getByText('Request Location'));
    await waitFor(() => expect(locationService.requestLocationPermission).toHaveBeenCalled());
    await waitFor(() => expect(locationService.getCurrentLocation).toHaveBeenCalled());
    expect(getByText(/Latitude:/)).toBeTruthy();
  });
});

describe('UpdateLocationExample', () => {
  it('renders correctly and updates location', async () => {
    const { getByText } = renderWithProviders(<UpdateLocationExample />);
    expect(getByText('Update My Location')).toBeTruthy();
    fireEvent.press(getByText('Update Location in TribeFind'));
    await waitFor(() => expect(locationService.getCurrentLocation).toHaveBeenCalled());
    await waitFor(() => expect(locationService.updateUserLocation).toHaveBeenCalledWith(
      mockUser.id,
      expect.any(Object)
    ));
    expect(getByText(/Last updated:/)).toBeTruthy();
  });
});

describe('LocationTrackingExample', () => {
  it('renders correctly and starts/stops tracking', async () => {
    const { getByText } = renderWithProviders(<LocationTrackingExample />);
    expect(getByText('Location Tracking')).toBeTruthy();
    fireEvent.press(getByText('Start Tracking'));
    await waitFor(() => expect(locationService.startLocationTracking).toHaveBeenCalledWith(
      mockUser.id,
      expect.any(Object)
    ));
    expect(getByText('Stop Tracking')).toBeTruthy();
    fireEvent.press(getByText('Stop Tracking'));
    await waitFor(() => expect(locationService.stopLocationTracking).toHaveBeenCalled());
  });
});

describe('NearbyTribeMembersExample', () => {
  it('renders correctly and finds nearby members', async () => {
    const { getByText } = renderWithProviders(<NearbyTribeMembersExample />);
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
