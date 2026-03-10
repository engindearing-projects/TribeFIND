import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AuthScreen from '../../screens/AuthScreen';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock AuthService
const mockSignIn = jest.fn().mockResolvedValue({ error: null });
const mockSignUp = jest.fn().mockResolvedValue({ error: null });
const mockSignInWithGoogle = jest.fn().mockResolvedValue({ error: null });
const mockSignInWithTwitter = jest.fn().mockResolvedValue({ error: null });
const mockSignInWithApple = jest.fn().mockResolvedValue({ error: null });
const mockClearSession = jest.fn().mockResolvedValue({ error: null });
const mockEnableGoogleSignIn = jest.fn().mockResolvedValue({ error: null });

jest.mock('../../services/AuthService', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithTwitter: mockSignInWithTwitter,
    signInWithApple: mockSignInWithApple,
    clearSession: mockClearSession,
    enableGoogleSignIn: mockEnableGoogleSignIn,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../services/GoogleSignInService', () => ({
  GoogleSignInService: {
    configure: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ user: { email: 'mockgoogle@example.com' }, idToken: 'mock-google-id-token' }),
  },
}));

jest.mock('../../services/AppleSignInService', () => ({
  AppleSignInService: {
    isAvailable: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ user: { email: 'mockapple@example.com' }, identityToken: 'mock-apple-id-token' }),
    signOut: jest.fn().mockResolvedValue(true),
    getCredentialState: jest.fn().mockResolvedValue('authorized'),
    validateCredential: jest.fn().mockResolvedValue(true),
  },
}));

jest.spyOn(Alert, 'alert');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthScreen', () => {
  it('renders the sign in form by default', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    expect(getByText('TribeFind')).toBeTruthy();
    expect(getByText('Welcome back')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email address')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Enter TribeFind')).toBeTruthy();
  });

  it('switches to sign up mode', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Join Now'));

    expect(getByText('Join your tribe')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByPlaceholderText('Choose a unique username')).toBeTruthy();
    expect(getByPlaceholderText('How should we call you?')).toBeTruthy();
    expect(getByText('Join TribeFind')).toBeTruthy();
  });

  it('switches back to sign in mode', () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Join Now'));
    expect(getByText('Create Account')).toBeTruthy();

    fireEvent.press(getByText('Sign In'));
    expect(getByText('Welcome back')).toBeTruthy();
  });

  it('shows social auth buttons', () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByText('Continue with Twitter')).toBeTruthy();
    expect(getByText('Continue with Apple')).toBeTruthy();
  });

  it('shows validation error when fields are empty on sign in', () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Enter TribeFind'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows validation error when sign up fields are incomplete', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Join Now'));
    fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Create a secure password'), 'password123');
    // Leave username and display name empty
    fireEvent.press(getByText('Join TribeFind'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signIn with email and password', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Enter TribeFind'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('calls signUp with all fields', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Join Now'));
    fireEvent.changeText(getByPlaceholderText('Choose a unique username'), 'newuser');
    fireEvent.changeText(getByPlaceholderText('How should we call you?'), 'New User');
    fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('Create a secure password'), 'password123');
    fireEvent.press(getByText('Join TribeFind'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('new@test.com', 'password123', 'newuser', 'New User');
    });
  });

  it('shows error from sign in result', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'Invalid credentials' });

    const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrong');
    fireEvent.press(getByText('Enter TribeFind'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Authentication Error', 'Invalid credentials');
    });
  });

  it('calls signInWithGoogle when google button pressed', async () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Continue with Google'));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('calls signInWithTwitter when twitter button pressed', async () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Continue with Twitter'));

    await waitFor(() => {
      expect(mockSignInWithTwitter).toHaveBeenCalled();
    });
  });

  it('calls signInWithApple when apple button pressed', async () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    fireEvent.press(getByText('Continue with Apple'));

    await waitFor(() => {
      expect(mockSignInWithApple).toHaveBeenCalled();
    });
  });

  it('shows clear session button and calls clearSession', async () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    const clearButton = getByText('Clear All Sessions');
    expect(clearButton).toBeTruthy();

    fireEvent.press(clearButton);

    await waitFor(() => {
      expect(mockClearSession).toHaveBeenCalled();
    });
  });

  it('shows enable google sign-in button in sign-in mode', () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    expect(getByText(/Enable Google Sign-In/)).toBeTruthy();
  });

  it('renders footer text', () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    expect(getByText('Engineered at EnginDearing.soy')).toBeTruthy();
  });
});
