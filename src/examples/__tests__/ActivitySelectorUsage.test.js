import React from 'react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import {
  BasicActivitySelectionExample,
  OnboardingActivitySelectionExample,
  CategorySpecificExample,
  SingleSelectionExample,
  SkillLevelFocusedExample,
  InterestDiscoveryExample,
  DynamicActivityLoadingExample,
  PreselectedActivitiesExample,
  CustomRenderItemExample,
  SearchAndFilterExample,
  ThemedActivitySelectorExample,
  AccessibilityExample
} from '../ActivitySelectorUsage';
import { screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock Alert to prevent it from popping up during tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      ...RN.Alert,
      alert: jest.fn(),
    },
  };
});

describe('ActivitySelectorUsage Examples', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders BasicActivitySelectionExample correctly', () => {
    renderWithProviders(<BasicActivitySelectionExample />);
    expect(screen.getByText('Basic Activity Selection')).toBeVisible();
  });

  it('renders OnboardingActivitySelectionExample correctly', () => {
    renderWithProviders(<OnboardingActivitySelectionExample />);
    expect(screen.getByText('Onboarding: Choose Your Top 5 Interests')).toBeVisible();
  });

  it('renders CategorySpecificExample correctly', () => {
    renderWithProviders(<CategorySpecificExample />);
    expect(screen.getByText('Category-Specific Activity Selection')).toBeVisible();
  });

  it('renders SingleSelectionExample correctly', () => {
    renderWithProviders(<SingleSelectionExample />);
    expect(screen.getByText('Single Activity Selection')).toBeVisible();
  });

  it('renders SkillLevelFocusedExample correctly', () => {
    renderWithProviders(<SkillLevelFocusedExample />);
    expect(screen.getByText('Skill Level Assessment')).toBeVisible();
  });

  it('renders InterestDiscoveryExample correctly', () => {
    renderWithProviders(<InterestDiscoveryExample />);
    expect(screen.getByText('Physical Activities')).toBeVisible(); // First step title
  });

  it('renders DynamicActivityLoadingExample correctly', () => {
    renderWithProviders(<DynamicActivityLoadingExample />);
    expect(screen.getByText('Dynamic Activity Loading')).toBeVisible();
  });

  it('renders PreselectedActivitiesExample correctly', () => {
    renderWithProviders(<PreselectedActivitiesExample />);
    expect(screen.getByText('Pre-selected Activities')).toBeVisible();
  });

  it('renders CustomRenderItemExample correctly', () => {
    renderWithProviders(<CustomRenderItemExample />);
    expect(screen.getByText('Custom Activity Item Rendering')).toBeVisible();
  });

  it('renders SearchAndFilterExample correctly', () => {
    renderWithProviders(<SearchAndFilterExample />);
    expect(screen.getByText('Search and Filter Activities')).toBeVisible();
  });

  it('renders ThemedActivitySelectorExample correctly', () => {
    renderWithProviders(<ThemedActivitySelectorExample />);
    expect(screen.getByText('Themed Activity Selector')).toBeVisible();
  });

  it('renders AccessibilityExample correctly', () => {
    renderWithProviders(<AccessibilityExample />);
    expect(screen.getByText('Accessibility Features')).toBeVisible();
  });

  // Test interaction for BasicActivitySelectionExample
  it('allows selecting and deselecting activities in BasicActivitySelectionExample', async () => {
    renderWithProviders(<BasicActivitySelectionExample />);
    
    const runningActivity = await screen.findByText('Running'); 
    fireEvent.press(runningActivity);
    expect(screen.getByText('You\'ve selected 1 activities')).toBeVisible();

    fireEvent.press(runningActivity); // Deselect
    expect(screen.queryByText('You\'ve selected 1 activities')).toBeNull();
  });

  // Test interaction for OnboardingActivitySelectionExample with maxSelections
  it('shows alert when max selections reached in OnboardingActivitySelectionExample', async () => {
    renderWithProviders(<OnboardingActivitySelectionExample />);
    expect(screen.getByText('Onboarding: Choose Your Top 5 Interests')).toBeVisible();

    const activities = ['Running', 'Cycling', 'Swimming', 'Hiking', 'Yoga'];
    for (const activity of activities) {
      const activityElement = await screen.findByText(activity);
      fireEvent.press(activityElement);
    }
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Great choices!', 
      "You've selected 5 activities. This will help us find your tribe!"
    );
  });
});
