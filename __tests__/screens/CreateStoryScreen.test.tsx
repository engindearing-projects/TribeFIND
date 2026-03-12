import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateStoryScreen from '../../screens/CreateStoryScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///photo.jpg', type: 'image' }],
  }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///gallery.jpg', type: 'image' }],
  }),
}));

jest.mock('../../services/StoriesService', () => ({
  uploadStoryMedia: jest.fn().mockResolvedValue('https://example.com/uploaded.jpg'),
  createStory: jest.fn().mockResolvedValue({
    id: 'new-story',
    user_id: 'test-user-id',
    media_url: 'https://example.com/uploaded.jpg',
    media_type: 'image',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    views: [],
  }),
}));

const mockNavigation = {
  goBack: jest.fn(),
};

describe('CreateStoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the create story screen', () => {
    const { getByTestId } = renderWithProviders(
      <CreateStoryScreen navigation={mockNavigation} />
    );
    expect(getByTestId('create-story-screen')).toBeTruthy();
  });

  it('shows title "New Story"', () => {
    const { getByText } = renderWithProviders(
      <CreateStoryScreen navigation={mockNavigation} />
    );
    expect(getByText('New Story')).toBeTruthy();
  });

  it('shows camera and gallery pick buttons initially', () => {
    const { getByTestId } = renderWithProviders(
      <CreateStoryScreen navigation={mockNavigation} />
    );
    expect(getByTestId('camera-pick-button')).toBeTruthy();
    expect(getByTestId('library-pick-button')).toBeTruthy();
  });

  it('navigates back on close press', () => {
    const { getByTestId } = renderWithProviders(
      <CreateStoryScreen navigation={mockNavigation} />
    );
    fireEvent.press(getByTestId('close-create-story'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows preview after picking from gallery', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <CreateStoryScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('library-pick-button'));

    await waitFor(() => {
      expect(getByTestId('remove-media-button')).toBeTruthy();
      expect(getByTestId('story-caption-input')).toBeTruthy();
      expect(getByTestId('post-story-button')).toBeTruthy();
    });
  });

  it('shows caption input and post button after media selection', async () => {
    const { getByTestId, getByText } = renderWithProviders(
      <CreateStoryScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('camera-pick-button'));

    await waitFor(() => {
      expect(getByTestId('story-caption-input')).toBeTruthy();
      expect(getByText('Share Story')).toBeTruthy();
    });
  });

  it('posts story and navigates back on success', async () => {
    const { getByTestId } = renderWithProviders(
      <CreateStoryScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('library-pick-button'));

    await waitFor(() => {
      expect(getByTestId('post-story-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('post-story-button'));

    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
});
