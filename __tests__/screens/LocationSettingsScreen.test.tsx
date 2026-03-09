import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import LocationSettingsScreen from '../../screens/LocationSettingsScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('LocationSettingsScreen', () => {
  it('renders section titles', () => {
    const { getByText, getAllByText } = renderWithProviders(<LocationSettingsScreen />);

    expect(getByText('Location Sharing')).toBeTruthy();
    expect(getByText('Privacy Level')).toBeTruthy();
    expect(getAllByText('Ghost Mode').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Current Status')).toBeTruthy();
  });

  it('renders share location toggle', () => {
    const { getByText } = renderWithProviders(<LocationSettingsScreen />);

    expect(getByText('Share Location')).toBeTruthy();
    expect(getByText('Allow friends to see your location')).toBeTruthy();
  });

  it('renders precise location toggle', () => {
    const { getByText } = renderWithProviders(<LocationSettingsScreen />);

    expect(getByText('Precise Location')).toBeTruthy();
    expect(getByText('Show exact location vs approximate area')).toBeTruthy();
  });

  it('renders all privacy level options', () => {
    const { getByText } = renderWithProviders(<LocationSettingsScreen />);

    expect(getByText('Everyone')).toBeTruthy();
    expect(getByText('Friends')).toBeTruthy();
    expect(getByText('Custom')).toBeTruthy();
    expect(getByText('Nobody')).toBeTruthy();
  });

  it('shows checkmark on selected privacy level', () => {
    const { getAllByText } = renderWithProviders(<LocationSettingsScreen />, {
      privacy: { privacyLevel: 'everyone' },
    });

    expect(getAllByText('✓').length).toBe(1);
  });

  it('renders ghost mode toggle', () => {
    const { getAllByText } = renderWithProviders(<LocationSettingsScreen />);

    expect(getAllByText('Ghost Mode').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Hide from all friends temporarily').length).toBe(1);
  });

  it('shows inactive tracking status by default', () => {
    const { getByText } = renderWithProviders(<LocationSettingsScreen />);

    expect(getByText('Location Tracking')).toBeTruthy();
    expect(getByText('🔴 Inactive')).toBeTruthy();
  });

  it('shows active tracking status when tracking is enabled', () => {
    const { getByText } = renderWithProviders(<LocationSettingsScreen />, {
      location: { isTracking: true, currentLocation: null },
    });

    expect(getByText('🟢 Active')).toBeTruthy();
  });

  it('shows current location when available', () => {
    const { getByText } = renderWithProviders(<LocationSettingsScreen />, {
      location: {
        isTracking: true,
        currentLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: Date.now(),
        },
      },
    });

    expect(getByText('Current Location')).toBeTruthy();
    expect(getByText('📍 37.7749, -122.4194')).toBeTruthy();
  });

  it('dispatches privacy level change on press', () => {
    const { getByText, store } = renderWithProviders(<LocationSettingsScreen />);

    fireEvent.press(getByText('Nobody'));

    const state = store.getState();
    expect(state.privacy.privacyLevel).toBe('nobody');
  });
});
