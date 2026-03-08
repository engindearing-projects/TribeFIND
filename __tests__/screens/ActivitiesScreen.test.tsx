import React from 'react';
import { waitFor } from '@testing-library/react-native';
import ActivitiesScreen from '../../screens/ActivitiesScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => React.createElement(Text, props, name),
  };
});

describe('ActivitiesScreen', () => {
  it('shows loading state initially', () => {
    const { getByText } = renderWithProviders(<ActivitiesScreen />);

    expect(getByText('Loading activities...')).toBeTruthy();
  });

  it('renders header after loading', async () => {
    const { getByText } = renderWithProviders(<ActivitiesScreen />);

    await waitFor(() => {
      expect(getByText('Choose Your Activities')).toBeTruthy();
    });
  });

  it('renders subtitle text', async () => {
    const { getByText } = renderWithProviders(<ActivitiesScreen />);

    await waitFor(() => {
      expect(getByText("Select activities you're interested in")).toBeTruthy();
    });
  });

  it('renders selected count', async () => {
    const { getByText } = renderWithProviders(<ActivitiesScreen />);

    await waitFor(() => {
      expect(getByText('0 selected')).toBeTruthy();
    });
  });

  it('shows empty state when no activities available', async () => {
    const { getByText } = renderWithProviders(<ActivitiesScreen />);

    await waitFor(() => {
      expect(getByText('No activities available')).toBeTruthy();
    });
  });
});
