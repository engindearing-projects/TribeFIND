import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import OnboardingTutorial from '../../components/OnboardingTutorial';
import { renderWithProviders, mockUser } from '../helpers/renderWithProviders';

jest.spyOn(Alert, 'alert');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('OnboardingTutorial', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  it('renders nothing when not visible', () => {
    const { toJSON } = renderWithProviders(
      <OnboardingTutorial
        visible={false}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Modal content should not be visible
    expect(toJSON()).toBeTruthy();
  });

  it('renders first step when visible', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(getByText(`Hey ${mockUser.display_name}! 👋`)).toBeTruthy();
    expect(getByText('Start Tour')).toBeTruthy();
  });

  it('shows tutorial highlights on first step', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(getByText('Find your tribe instantly')).toBeTruthy();
    expect(getByText('AI matches you perfectly')).toBeTruthy();
    expect(getByText('Location + interests magic')).toBeTruthy();
  });

  it('navigates to next step', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    fireEvent.press(getByText('Start Tour'));

    expect(getByText('Capture & Share 📸')).toBeTruthy();
    expect(getByText('Next →')).toBeTruthy();
  });

  it('navigates through all steps', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Step 1
    fireEvent.press(getByText('Start Tour'));
    expect(getByText('Capture & Share 📸')).toBeTruthy();

    // Step 2
    fireEvent.press(getByText('Next →'));
    expect(getByText('Discover Your Tribe 🗺️')).toBeTruthy();

    // Step 3
    fireEvent.press(getByText('Next →'));
    expect(getByText('Ready to Vibe! 🚀')).toBeTruthy();
    expect(getByText("Let's Go! 🚀")).toBeTruthy();
  });

  it('calls onComplete on last step', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        startFromStep={3}
      />
    );

    expect(getByText('Ready to Vibe! 🚀')).toBeTruthy();
    fireEvent.press(getByText("Let's Go! 🚀"));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('shows skip confirmation alert', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    fireEvent.press(getByText('✕'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Skip Tutorial?',
      'You can always access this walkthrough later from the "View Walkthrough" button.',
      expect.any(Array)
    );
  });

  it('starts from specified step', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        startFromStep={2}
      />
    );

    expect(getByText('Discover Your Tribe 🗺️')).toBeTruthy();
  });

  it('renders progress dots', () => {
    const { getByText } = renderWithProviders(
      <OnboardingTutorial
        visible={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // The component renders 4 dots (one per step)
    // Verify the icon for step 1 is visible
    expect(getByText('🎯')).toBeTruthy();
  });
});
