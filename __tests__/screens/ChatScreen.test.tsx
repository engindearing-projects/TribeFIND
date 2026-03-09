import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ChatScreen from '../../screens/ChatScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

// Mock navigation types
jest.mock('../../types/navigation', () => ({}));

// Override route mock with chat params
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: jest.fn(() => ({
      params: {
        chatRoomId: 'test-chat-room-id',
        otherUser: {
          id: 'other-user-id',
          username: 'otheruser',
          display_name: 'Other User',
          avatar: '👤',
          is_online: true,
        },
      },
    }),
    useIsFocused: jest.fn().mockReturnValue(true),
  };
});

describe('ChatScreen', () => {
  it('renders header with other user info', () => {
    const { getByText } = renderWithProviders(<ChatScreen />);

    expect(getByText('Other User')).toBeTruthy();
    expect(getByText('Online')).toBeTruthy();
  });

  it('renders back button', () => {
    const { getByText } = renderWithProviders(<ChatScreen />);

    expect(getByText('arrow-back')).toBeTruthy();
  });

  it('renders message input', () => {
    const { getByPlaceholderText } = renderWithProviders(<ChatScreen />);

    expect(getByPlaceholderText('Type a message...')).toBeTruthy();
  });

  it('renders send button', () => {
    const { getByText } = renderWithProviders(<ChatScreen />);

    expect(getByText('send')).toBeTruthy();
  });

  it('updates message text input', () => {
    const { getByPlaceholderText } = renderWithProviders(<ChatScreen />);

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Hello!');

    expect(input.props.value).toBe('Hello!');
  });

  it('shows offline status for offline user', async () => {
    // Import the mocked useRoute from the navigation mock
    const { useRoute } = require('@react-navigation/native');

    // Set the return value for this specific test
    useRoute.mockReturnValueOnce({
      params: {
        chatRoomId: 'test-chat-room-id',
        otherUser: {
          id: 'other-user-id',
          username: 'offlineuser',
          display_name: 'Offline User',
          avatar: '👤',
          is_online: false,
        },
      },
    });

    const { getByText, queryByText } = renderWithProviders(<ChatScreen />);

    await waitFor(() => {
      expect(getByText('Offline User')).toBeTruthy();
      expect(queryByText('Online')).toBeNull(); // Ensure 'Online' text is not present
      expect(getByText('Offline')).toBeTruthy();
    });
  });
});
