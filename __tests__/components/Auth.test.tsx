import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Auth from '../../components/Auth';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock supabase
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

describe('Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ data: { session: { access_token: 'test' } }, error: null });
  });

  it('renders the login form', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<Auth />);

    expect(getByText('TribeFind')).toBeTruthy();
    expect(getByText('Login to continue')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('updates email and password fields', () => {
    const { getByPlaceholderText } = renderWithProviders(<Auth />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'user@test.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('user@test.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls signInWithPassword when Sign In is pressed', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'pass123',
      });
    });
  });

  it('calls signUp when Sign Up is pressed', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'newpass');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'newpass',
      });
    });
  });

  it('shows alert on sign in error', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    jest.spyOn(Alert, 'alert');

    const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'bad@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('shows alert on sign up error', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { session: null }, error: { message: 'Email taken' } });
    jest.spyOn(Alert, 'alert');

    const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'taken@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Email taken');
    });
  });

  it('shows verification alert when sign up succeeds without session', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    jest.spyOn(Alert, 'alert');

    const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Please check your inbox for email verification!');
    });
  });

  it('shows loading state during sign in', async () => {
    let resolveSignIn: (value: any) => void;
    mockSignInWithPassword.mockReturnValueOnce(
      new Promise((resolve) => { resolveSignIn = resolve; })
    );

    const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Signing in...')).toBeTruthy();
    });

    resolveSignIn!({ error: null });

    await waitFor(() => {
      expect(getByText('Sign In')).toBeTruthy();
    });
  });
});
