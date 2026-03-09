import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import CameraScreen from '../../screens/CameraScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock expo-media-library
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  saveToLibraryAsync: jest.fn().mockResolvedValue(null),
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

// Mock ImageFilters component
jest.mock('../../components/ImageFilters', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(Text, null, 'ImageFilters'),
  };
});

describe('CameraScreen', () => {
  it('renders camera view when permission is granted', () => {
    const { getByText } = renderWithProviders(<CameraScreen />);

    // Camera should render with controls
    expect(getByText('OFF')).toBeTruthy();
    expect(getByText('Photo')).toBeTruthy();
  });

  it('renders flash control', () => {
    const { getByText } = renderWithProviders(<CameraScreen />);

    // Flash text displays current mode
    expect(getByText('OFF')).toBeTruthy();
  });

  it('renders photo mode button', () => {
    const { getByText } = renderWithProviders(<CameraScreen />);

    expect(getByText('Photo')).toBeTruthy();
  });

  it('renders camera control buttons', () => {
    const { getByText, getAllByText } = renderWithProviders(<CameraScreen />);

    // Icon buttons from Ionicons mock render as text
    expect(getByText('images')).toBeTruthy(); // gallery button
    expect(getAllByText('camera').length).toBeGreaterThanOrEqual(1); // capture button inner icon
    expect(getByText('camera-reverse')).toBeTruthy(); // flip button
  });
});
