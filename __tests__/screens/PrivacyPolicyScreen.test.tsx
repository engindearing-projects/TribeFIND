import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import PrivacyPolicyScreen from '../../screens/PrivacyPolicyScreen';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('PrivacyPolicyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the screen with testID', () => {
    const { getByTestId } = render(<PrivacyPolicyScreen />);
    expect(getByTestId('privacy-policy-screen')).toBeTruthy();
  });

  it('renders the header title', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('renders the effective date', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText(/Effective Date:/)).toBeTruthy();
  });

  it('renders all major section titles', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);

    expect(getByText('1. Information We Collect')).toBeTruthy();
    expect(getByText('2. How We Use Your Information')).toBeTruthy();
    expect(getByText('3. How We Share Your Information')).toBeTruthy();
    expect(getByText('4. Data Storage and Security')).toBeTruthy();
    expect(getByText('5. Your Rights and Choices')).toBeTruthy();
    expect(getByText('6. Children\'s Privacy')).toBeTruthy();
    expect(getByText('7. Third-Party Links')).toBeTruthy();
    expect(getByText('8. Changes to This Policy')).toBeTruthy();
    expect(getByText('9. Contact Us')).toBeTruthy();
  });

  it('renders data collection subsections', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);

    expect(getByText('Account Information')).toBeTruthy();
    expect(getByText('Location Data')).toBeTruthy();
    expect(getByText('Photos and Media')).toBeTruthy();
    expect(getByText('Messages')).toBeTruthy();
    expect(getByText('Usage Data')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = render(<PrivacyPolicyScreen />);

    fireEvent.press(getByTestId('privacy-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('opens email when contact email is pressed', () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    const { getByTestId } = render(<PrivacyPolicyScreen />);

    fireEvent.press(getByTestId('privacy-email-link'));
    expect(openURLSpy).toHaveBeenCalledWith('mailto:privacy@tribefind.app');

    openURLSpy.mockRestore();
  });

  it('displays the contact email address', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('privacy@tribefind.app')).toBeTruthy();
  });

  it('mentions children privacy age requirement', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText(/not intended for users under 13/)).toBeTruthy();
  });

  it('mentions Supabase and Sentry as service providers', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText(/Supabase for data storage/)).toBeTruthy();
    expect(getByText(/Sentry for error tracking/)).toBeTruthy();
  });
});
