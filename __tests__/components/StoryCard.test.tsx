import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StoryCard from '../../components/StoryCard';
import { StoryGroup } from '../../types/stories';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

const mockGroup: StoryGroup = {
  user_id: 'user-1',
  username: 'alice',
  display_name: 'Alice',
  avatar: 'https://example.com/alice.png',
  stories: [
    {
      id: 'story-1',
      user_id: 'user-1',
      media_url: 'https://example.com/photo.jpg',
      media_type: 'image',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      views: [],
    },
  ],
  has_unviewed: true,
  latest_at: new Date().toISOString(),
};

describe('StoryCard', () => {
  it('renders display name for other users', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <StoryCard group={mockGroup} onPress={onPress} />
    );
    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders "My Story" when isMyStory is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <StoryCard group={mockGroup} isMyStory onPress={onPress} />
    );
    expect(getByText('My Story')).toBeTruthy();
  });

  it('calls onPress when tapped with stories', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <StoryCard group={mockGroup} onPress={onPress} />
    );
    fireEvent.press(getByTestId('story-card-user-1'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onAddPress when isMyStory with no stories', () => {
    const onPress = jest.fn();
    const onAddPress = jest.fn();
    const emptyGroup = { ...mockGroup, stories: [] };
    const { getByTestId } = render(
      <StoryCard group={emptyGroup} isMyStory onPress={onPress} onAddPress={onAddPress} />
    );
    fireEvent.press(getByTestId('my-story-card'));
    expect(onAddPress).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows add badge for my story', () => {
    const onPress = jest.fn();
    const onAddPress = jest.fn();
    const { getByTestId } = render(
      <StoryCard group={mockGroup} isMyStory onPress={onPress} onAddPress={onAddPress} />
    );
    expect(getByTestId('add-story-button')).toBeTruthy();
  });

  it('does not show add badge for other users', () => {
    const onPress = jest.fn();
    const { queryByTestId } = render(
      <StoryCard group={mockGroup} onPress={onPress} />
    );
    expect(queryByTestId('add-story-button')).toBeNull();
  });

  it('shows avatar initial when no avatar URL', () => {
    const noAvatarGroup = { ...mockGroup, avatar: '' };
    const onPress = jest.fn();
    const { getByText } = render(
      <StoryCard group={noAvatarGroup} onPress={onPress} />
    );
    expect(getByText('A')).toBeTruthy();
  });
});
