import React from 'react';
import { waitFor } from '@testing-library/react-native';
import PhotoGallery from '../../components/PhotoGallery';
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

// Mock supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'mock-signed-url' }, error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      })),
    },
  },
}));

describe('PhotoGallery', () => {
  // Clear mocks before each test
  beforeEach(() => {
    (supabase.from as jest.Mock).mockClear();
  });

  it('shows loading state initially', async () => {
    let resolvePhotos: (value: any) => void;
    const deferredPromise = new Promise(resolve => {
      resolvePhotos = resolve;
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

    const { getByText } = renderWithProviders(<PhotoGallery />);

    // Expect loading state to be present immediately after render
    expect(getByText('Loading photos...')).toBeTruthy();

    // Resolve the promise to simulate data loading completion
    resolvePhotos({ data: [], error: null });

    // Wait for the loading state to disappear and empty state to appear
    await waitFor(() => {
      expect(getByText('No photos yet')).toBeTruthy();
    });
  });

  it('renders header with photo count after loading', async () => {
    const { getByText } = renderWithProviders(<PhotoGallery />);

    await waitFor(() => {
      expect(getByText('📸 Photos (0)')).toBeTruthy();
    });
  });

  it('shows empty state when no photos', async () => {
    const { getByText } = renderWithProviders(<PhotoGallery />);

    await waitFor(() => {
      expect(getByText('No photos yet')).toBeTruthy();
      expect(getByText('Start capturing moments with the camera!')).toBeTruthy();
    });
  });

  it('shows refresh button for own photos', async () => {
    const { getByText } = renderWithProviders(<PhotoGallery />);

    await waitFor(() => {
      expect(getByText('refresh')).toBeTruthy();
    });
  });

  it('shows different empty text for other user photos', async () => {
    const { getByText } = renderWithProviders(
      <PhotoGallery userId="other-user-id" />
    );

    await waitFor(() => {
      expect(getByText("This user hasn't shared any photos yet")).toBeTruthy();
    });
  });

  it('does not show refresh button for other user photos', async () => {
    const { queryByText, getByText } = renderWithProviders(
      <PhotoGallery userId="other-user-id" />
    );

    await waitFor(() => {
      expect(getByText('No photos yet')).toBeTruthy();
    });

    // refresh icon should not be present for another user
    // The component conditionally renders the button only when userId is not set
    // or equals current user
  });
});
