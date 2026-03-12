import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StoryViewerScreen from '../../screens/StoryViewerScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

jest.mock('../../services/StoriesService', () => ({
  recordStoryView: jest.fn().mockResolvedValue(undefined),
}));

const now = new Date();
const futureExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

const mockStoryGroups = [
  {
    user_id: 'user-2',
    username: 'bob',
    display_name: 'Bob',
    avatar: 'https://example.com/bob.png',
    stories: [
      {
        id: 'story-1',
        user_id: 'user-2',
        media_url: 'https://example.com/photo1.jpg',
        media_type: 'image',
        caption: 'First story',
        created_at: now.toISOString(),
        expires_at: futureExpiry,
        views: [],
      },
      {
        id: 'story-2',
        user_id: 'user-2',
        media_url: 'https://example.com/photo2.jpg',
        media_type: 'image',
        created_at: now.toISOString(),
        expires_at: futureExpiry,
        views: [],
      },
    ],
    has_unviewed: true,
    latest_at: now.toISOString(),
  },
];

const mockNavigation = {
  goBack: jest.fn(),
};

describe('StoryViewerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the story viewer when viewing a group', () => {
    const { getByTestId } = renderWithProviders(
      <StoryViewerScreen navigation={mockNavigation} />,
      {
        stories: {
          storyGroups: mockStoryGroups,
          viewingGroupIndex: 0,
          viewingStoryIndex: 0,
          myStories: [],
          loading: false,
        },
      }
    );
    expect(getByTestId('story-viewer-screen')).toBeTruthy();
  });

  it('shows display name of story author', () => {
    const { getByText } = renderWithProviders(
      <StoryViewerScreen navigation={mockNavigation} />,
      {
        stories: {
          storyGroups: mockStoryGroups,
          viewingGroupIndex: 0,
          viewingStoryIndex: 0,
          myStories: [],
          loading: false,
        },
      }
    );
    expect(getByText('Bob')).toBeTruthy();
  });

  it('shows caption when present', () => {
    const { getByText } = renderWithProviders(
      <StoryViewerScreen navigation={mockNavigation} />,
      {
        stories: {
          storyGroups: mockStoryGroups,
          viewingGroupIndex: 0,
          viewingStoryIndex: 0,
          myStories: [],
          loading: false,
        },
      }
    );
    expect(getByText('First story')).toBeTruthy();
  });

  it('renders close button', () => {
    const { getByTestId } = renderWithProviders(
      <StoryViewerScreen navigation={mockNavigation} />,
      {
        stories: {
          storyGroups: mockStoryGroups,
          viewingGroupIndex: 0,
          viewingStoryIndex: 0,
          myStories: [],
          loading: false,
        },
      }
    );
    expect(getByTestId('close-story-button')).toBeTruthy();
  });

  it('navigates back on close press', () => {
    const { getByTestId } = renderWithProviders(
      <StoryViewerScreen navigation={mockNavigation} />,
      {
        stories: {
          storyGroups: mockStoryGroups,
          viewingGroupIndex: 0,
          viewingStoryIndex: 0,
          myStories: [],
          loading: false,
        },
      }
    );
    fireEvent.press(getByTestId('close-story-button'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('does not render story content when no group is selected', () => {
    const { queryByTestId } = renderWithProviders(
      <StoryViewerScreen navigation={mockNavigation} />,
      {
        stories: {
          storyGroups: mockStoryGroups,
          viewingGroupIndex: null,
          viewingStoryIndex: 0,
          myStories: [],
          loading: false,
        },
      }
    );
    expect(queryByTestId('story-viewer-screen')).toBeNull();
  });

  it('renders progress bar', () => {
    const { getByTestId } = renderWithProviders(
      <StoryViewerScreen navigation={mockNavigation} />,
      {
        stories: {
          storyGroups: mockStoryGroups,
          viewingGroupIndex: 0,
          viewingStoryIndex: 0,
          myStories: [],
          loading: false,
        },
      }
    );
    expect(getByTestId('story-progress-bar')).toBeTruthy();
  });
});
