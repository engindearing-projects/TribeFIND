import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import TermsOfServiceScreen from '../../screens/TermsOfServiceScreen';

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

describe('TermsOfServiceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the screen with testID', () => {
    const { getByTestId } = render(<TermsOfServiceScreen />);
    expect(getByTestId('terms-of-service-screen')).toBeTruthy();
  });

  it('renders the header title', () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText('Terms of Service')).toBeTruthy();
  });

  it('renders the effective date', () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText(/Effective Date:/)).toBeTruthy();
  });

  it('renders all major section titles', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(getByText('1. Eligibility')).toBeTruthy();
    expect(getByText('2. Account Registration')).toBeTruthy();
    expect(getByText('3. Acceptable Use')).toBeTruthy();
    expect(getByText('4. User Content')).toBeTruthy();
    expect(getByText('5. Location Services')).toBeTruthy();
    expect(getByText('6. Privacy')).toBeTruthy();
    expect(getByText('7. Safety Guidelines')).toBeTruthy();
    expect(getByText('8. Intellectual Property')).toBeTruthy();
    expect(getByText('9. Termination')).toBeTruthy();
    expect(getByText('10. Disclaimers')).toBeTruthy();
    expect(getByText('11. Limitation of Liability')).toBeTruthy();
    expect(getByText('12. Dispute Resolution')).toBeTruthy();
    expect(getByText('13. Changes to These Terms')).toBeTruthy();
    expect(getByText('14. Contact Us')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = render(<TermsOfServiceScreen />);

    fireEvent.press(getByTestId('terms-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('opens email when contact email is pressed', () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    const { getByTestId } = render(<TermsOfServiceScreen />);

    fireEvent.press(getByTestId('terms-email-link'));
    expect(openURLSpy).toHaveBeenCalledWith('mailto:support@tribefind.app');

    openURLSpy.mockRestore();
  });

  it('displays the contact email address', () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText('support@tribefind.app')).toBeTruthy();
  });

  it('mentions minimum age requirement', () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText(/at least 13 years old/)).toBeTruthy();
  });

  it('includes safety guidelines about meeting in public', () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText(/Meet in public places/)).toBeTruthy();
  });

  it('mentions story auto-expiry', () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText(/Stories expire automatically after 24 hours/)).toBeTruthy();
  });

  it('includes acceptable use restrictions', () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText(/Harass, bully, threaten/)).toBeTruthy();
    expect(getByText(/automated scripts, bots/)).toBeTruthy();
  });
});
