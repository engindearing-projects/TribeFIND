import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import UserSearchScreen from '../../screens/UserSearchScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

describe('UserSearchScreen', () => {
  it('renders the header', () => {
    const { getByText } = renderWithProviders(<UserSearchScreen />);

    expect(getByText('Find Your Tribe')).toBeTruthy();
    expect(getByText('Connect with like-minded people')).toBeTruthy();
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = renderWithProviders(<UserSearchScreen />);

    expect(getByPlaceholderText('Search by username or name...')).toBeTruthy();
  });

  it('shows nearby users mode text by default', () => {
    const { getByText } = renderWithProviders(<UserSearchScreen />);

    expect(getByText('Recently active users (last 7 days)')).toBeTruthy();
  });

  it('switches to search mode when typing', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<UserSearchScreen />);

    fireEvent.changeText(getByPlaceholderText('Search by username or name...'), 'john');

    expect(getByText('Search results for "john"')).toBeTruthy();
  });

  it('switches back to nearby mode when search cleared', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<UserSearchScreen />);

    fireEvent.changeText(getByPlaceholderText('Search by username or name...'), 'john');
    expect(getByText('Search results for "john"')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Search by username or name...'), '');
    expect(getByText('Recently active users (last 7 days)')).toBeTruthy();
  });

  it('shows clear button when search text exists', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<UserSearchScreen />);

    fireEvent.changeText(getByPlaceholderText('Search by username or name...'), 'john');

    expect(getByText('close-circle')).toBeTruthy();
  });

  it('clears search on clear button press', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<UserSearchScreen />);

    fireEvent.changeText(getByPlaceholderText('Search by username or name...'), 'john');
    fireEvent.press(getByText('close-circle'));

    expect(getByText('Recently active users (last 7 days)')).toBeTruthy();
  });
});
