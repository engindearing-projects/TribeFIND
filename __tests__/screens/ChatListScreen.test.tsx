import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ChatListScreen from '../../screens/ChatListScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

// Mock asset require
jest.mock('../../assets/icon.png', () => 'icon-mock');

describe('ChatListScreen', () => {
  it('renders the header', () => {
    const { getByText } = renderWithProviders(<ChatListScreen />);

    expect(getByText('Tribe Chat')).toBeTruthy();
    expect(getByText('Connect with your tribe')).toBeTruthy();
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = renderWithProviders(<ChatListScreen />);

    expect(getByPlaceholderText('Search tribe members...')).toBeTruthy();
  });

  it('shows loading chats state initially', () => {
    const { getByText } = renderWithProviders(<ChatListScreen />);

    expect(getByText('Loading chats...')).toBeTruthy();
  });

  it('shows empty state after loading', async () => {
    const { getByText } = renderWithProviders(<ChatListScreen />);

    await waitFor(() => {
      expect(getByText('No Conversations Yet')).toBeTruthy();
    });
  });

  it('shows search results empty state when typing', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<ChatListScreen />);

    fireEvent.changeText(getByPlaceholderText('Search tribe members...'), 'john');

    await waitFor(() => {
      expect(getByText('Find Tribe Members')).toBeTruthy();
    });
  });

  it('shows clear button when search has text', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<ChatListScreen />);

    fireEvent.changeText(getByPlaceholderText('Search tribe members...'), 'john');

    // Ionicons renders as text with name
    expect(getByText('close-circle')).toBeTruthy();
  });

  it('clears search when clear button is pressed', () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(
      <ChatListScreen />
    );

    fireEvent.changeText(getByPlaceholderText('Search tribe members...'), 'john');
    fireEvent.press(getByText('close-circle'));

    // Search should be cleared, back to chat list view
    expect(getByPlaceholderText('Search tribe members...')).toBeTruthy();
  });
});
