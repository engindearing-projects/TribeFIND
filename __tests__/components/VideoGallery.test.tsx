import React from 'react';
import { waitFor } from '@testing-library/react-native';
import VideoGallery from '../../components/VideoGallery';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { supabase } from '../../lib/supabase'; // Import supabase to mock it

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

// Mock supabase
// This mock will be used by default. We'll override specific calls in tests.
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })), // Default to empty data
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })), // Also keep this for cases without eq
      })),
    })),
  },
}));

describe('VideoGallery', () => {
  // Clear mocks before each test
  beforeEach(() => {
    (supabase.from as jest.Mock).mockClear();
  });

  it('shows loading state initially', async () => {
    let resolveVideos: (value: any) => void;
    const deferredPromise = new Promise(resolve => {
      resolveVideos = resolve;
    });

    // Override the default mock for this specific test
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => deferredPromise),
        })),
        order: jest.fn(() => deferredPromise),
      })),
    });

    const { getByText } = renderWithProviders(<VideoGallery />);

    // Expect loading state to be present immediately after render
    expect(getByText('Loading videos...')).toBeTruthy();

    // Resolve the promise to simulate data loading completion
    resolveVideos({ data: [], error: null });

    // Wait for the loading state to disappear and empty state to appear
    await waitFor(() => {
      expect(getByText('No videos yet')).toBeTruthy();
    });
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
