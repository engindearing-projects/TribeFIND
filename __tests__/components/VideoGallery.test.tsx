import React from 'react';
import { waitFor } from '@testing-library/react-native';
import VideoGallery from '../../components/VideoGallery';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

// Mock expo-av
jest.mock('expo-av', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Video: (props: any) => React.createElement(View, { testID: 'video', ...props }),
    ResizeMode: {
      CONTAIN: 'contain',
      COVER: 'cover',
    },
  };
});

describe('VideoGallery', () => {
  it('shows loading state initially', () => {
    const { getByText } = renderWithProviders(<VideoGallery />);

    expect(getByText('Loading videos...')).toBeTruthy();
  });

  it('renders header with video count after loading', async () => {
    const { getByText } = renderWithProviders(<VideoGallery />);

    await waitFor(() => {
      expect(getByText('🎥 Videos (0)')).toBeTruthy();
    });
  });

  it('shows empty state when no videos', async () => {
    const { getByText } = renderWithProviders(<VideoGallery />);

    await waitFor(() => {
      expect(getByText('No videos yet')).toBeTruthy();
      expect(getByText('Start recording moments with the video camera!')).toBeTruthy();
    });
  });

  it('shows refresh button for own videos', async () => {
    const { getByText } = renderWithProviders(<VideoGallery />);

    await waitFor(() => {
      expect(getByText('refresh')).toBeTruthy();
    });
  });

  it('shows different empty text for other user videos', async () => {
    const { getByText } = renderWithProviders(
      <VideoGallery userId="other-user-id" />
    );

    await waitFor(() => {
      expect(getByText("This user hasn't shared any videos yet")).toBeTruthy();
    });
  });
});
