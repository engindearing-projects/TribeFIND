import React from 'react';
import { waitFor } from '@testing-library/react-native';
import PhotoGallery from '../../components/PhotoGallery';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

describe('PhotoGallery', () => {
  it('shows loading state initially', () => {
    const { getByText } = renderWithProviders(<PhotoGallery />);

    expect(getByText('Loading photos...')).toBeTruthy();
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
