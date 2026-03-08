import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';
import { renderWithProviders, mockUser } from '../helpers/renderWithProviders';

// Mock child components
jest.mock('../../components/PhotoGallery', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(Text, null, 'PhotoGallery'),
  };
});

jest.mock('../../components/VideoGallery', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(Text, null, 'VideoGallery'),
  };
});

jest.mock('../../components/OnboardingTutorial', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ visible }: { visible: boolean }) =>
      visible ? React.createElement(Text, null, 'OnboardingTutorial') : null,
  };
});

describe('HomeScreen', () => {
  it('renders with user greeting', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    expect(getByText(`Hey ${mockUser.display_name}! 👋`)).toBeTruthy();
    expect(getByText('Your captured moments')).toBeTruthy();
  });

  it('renders photo and video tabs', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    expect(getByText('📸 Photos')).toBeTruthy();
    expect(getByText('🎥 Videos')).toBeTruthy();
  });

  it('shows PhotoGallery by default', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    expect(getByText('PhotoGallery')).toBeTruthy();
  });

  it('switches to VideoGallery when videos tab is pressed', () => {
    const { getByText, queryByText } = renderWithProviders(<HomeScreen />);

    fireEvent.press(getByText('🎥 Videos'));

    expect(getByText('VideoGallery')).toBeTruthy();
    expect(queryByText('PhotoGallery')).toBeNull();
  });

  it('switches back to PhotoGallery', () => {
    const { getByText, queryByText } = renderWithProviders(<HomeScreen />);

    fireEvent.press(getByText('🎥 Videos'));
    fireEvent.press(getByText('📸 Photos'));

    expect(getByText('PhotoGallery')).toBeTruthy();
    expect(queryByText('VideoGallery')).toBeNull();
  });

  it('shows walkthrough button when onboarding is completed', () => {
    const { getByText } = renderWithProviders(<HomeScreen />, {
      tutorial: { hasCompletedOnboarding: true, tutorialVisible: false, firstTimeUser: false, lastCompletedStep: 3 },
    });

    expect(getByText('📚 View Walkthrough')).toBeTruthy();
  });

  it('does not show walkthrough button when onboarding is not completed', () => {
    const { queryByText } = renderWithProviders(<HomeScreen />, {
      tutorial: { hasCompletedOnboarding: false, tutorialVisible: false, firstTimeUser: true, lastCompletedStep: -1 },
    });

    expect(queryByText('📚 View Walkthrough')).toBeNull();
  });

  it('shows tutorial when tutorialVisible is true', () => {
    const { getByText } = renderWithProviders(<HomeScreen />, {
      tutorial: { hasCompletedOnboarding: false, tutorialVisible: true, firstTimeUser: true, lastCompletedStep: -1 },
    });

    expect(getByText('OnboardingTutorial')).toBeTruthy();
  });
});
