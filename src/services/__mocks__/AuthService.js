import React from 'react';

export const useAuth = jest.fn(() => ({
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    username: 'mockuser',
  },
  session: { access_token: 'mock-token' },
  isAuthenticated: true,
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  signOut: jest.fn(),
  loading: false,
  error: null,
}));

// If AuthService also exports other components or services, mock them here.
// For example, if it exports AppleSignInService:
export const AppleSignInService = {};
