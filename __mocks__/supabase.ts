import { jest } from '@jest/globals';
import { Session, User } from '@supabase/supabase-js';

export const mockUser: User = {
  id: 'mock-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'mock@example.com',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Mock the supabase client
export const supabase = {
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: jest.fn((callback) => {
      // Immediately call the callback with a mock session if needed for initial state
      // callback('SIGNED_IN', mockSession);
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    }),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { session: mockSession }, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    resetPasswordForEmail: jest.fn(() => Promise.resolve({ data: null, error: null })),
    updateUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    // Add other auth methods as needed
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: mockUser, error: null })),
    insert: jest.fn(() => Promise.resolve({ data: [mockUser], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [mockUser], error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  // Add other top-level supabase methods as needed
};

// Mock testSupabaseConnection if it exists
export const testSupabaseConnection = jest.fn(() => Promise.resolve(true));
