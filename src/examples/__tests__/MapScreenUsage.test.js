import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  BasicMapExample,
  MapWithHeaderExample,
  MapWithActivityFilterExample,
  MapWithStatsExample,
  NavigationMapExample,
  MapWithSettingsExample,
} from '../MapScreenUsage';

// Mock MapScreen (assuming it's a complex component with external dependencies like actual maps)
jest.mock('../../screens/MapScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return ({ onUserPress, onConnectPress }) => (
    <View testID="mock-map-screen">
      <Text>Mock Map Screen</Text>
      {onUserPress && <Text>User press handler present</Text>}
      {onConnectPress && <Text>Connect press handler present</Text>}
    </View>
  );
});

describe('BasicMapExample', () => {
  it('renders correctly', () => {
    const { getByTestId, getByText } = render(<BasicMapExample />);
    expect(getByTestId('mock-map-screen')).toBeTruthy();
    expect(getByText('Mock Map Screen')).toBeTruthy();
  });
});

describe('MapWithHeaderExample', () => {
  it('renders correctly with header and share button', () => {
    const { getByText, getByTestId } = render(<MapWithHeaderExample />);
    expect(getByText('TribeFind Map')).toBeTruthy();
    expect(getByText('📍 Share')).toBeTruthy();
    expect(getByTestId('mock-map-screen')).toBeTruthy();
  });

  it('calls Alert on share button press', () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = render(<MapWithHeaderExample />);
    fireEvent.press(getByText('📍 Share'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Share Location',
      'Allow friends to see your location for the next hour?',
      expect.any(Array)
    );
    alertSpy.mockRestore();
  });
});

describe('MapWithActivityFilterExample', () => {
  it('renders correctly with filter button', () => {
    const { getByText, getByTestId } = render(<MapWithActivityFilterExample />);
    expect(getByText('🎭 Filter Activities (0)')).toBeTruthy();
    expect(getByTestId('mock-map-screen')).toBeTruthy();
  });

  it('calls Alert on filter button press', () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = render(<MapWithActivityFilterExample />);
    fireEvent.press(getByText('🎭 Filter Activities (0)'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Filter by Activity',
      'Choose activities to find tribe members',
      expect.any(Array)
    );
    alertSpy.mockRestore();
  });
});

describe('MapWithStatsExample', () => {
  it('renders correctly with initial stats', async () => {
    const { getByText, getByTestId } = render(<MapWithStatsExample />);
    expect(getByText('Nearby')).toBeTruthy();
    expect(getByText('Shared')).toBeTruthy();
    expect(getByText('Connected')).toBeTruthy();
    expect(getByTestId('mock-map-screen')).toBeTruthy();

    // Check for initial 0 stats
    expect(getByText('0', { exact: false })).toBeTruthy(); // This might need refinement if other 0s exist

    // Wait for stats to update
    await waitFor(() => {
      expect(getByText('12')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    }, { timeout: 2500 }); // Adjust timeout if needed
  });
});

describe('NavigationMapExample', () => {
  it('renders correctly and passes handlers to MapScreen', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId, getByText } = render(<NavigationMapExample navigation={mockNavigation} />);
    expect(getByTestId('mock-map-screen')).toBeTruthy();
    expect(getByText('User press handler present')).toBeTruthy();
    expect(getByText('Connect press handler present')).toBeTruthy();
  });
});

describe('MapWithSettingsExample', () => {
  it('renders correctly with settings buttons', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByText, getByTestId } = render(<MapWithSettingsExample navigation={mockNavigation} />);
    expect(getByText('⚙️ Location')).toBeTruthy();
    expect(getByText('🔒 Privacy')).toBeTruthy();
    expect(getByTestId('mock-map-screen')).toBeTruthy();
  });

  it('calls navigation.navigate on location settings press', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByText } = render(<MapWithSettingsExample navigation={mockNavigation} />);
    fireEvent.press(getByText('⚙️ Location'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('LocationSettings');
  });

  it('calls Alert on privacy settings press', () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const mockNavigation = { navigate: jest.fn() };
    const { getByText } = render(<MapWithSettingsExample navigation={mockNavigation} />);
    fireEvent.press(getByText('🔒 Privacy'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Privacy Settings',
      'Control who can see your location',
      expect.any(Array)
    );
    alertSpy.mockRestore();
  });
});
