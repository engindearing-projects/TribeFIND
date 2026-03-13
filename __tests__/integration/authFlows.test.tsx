import React, { useState } from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Text, TouchableOpacity, View } from 'react-native'
import authSlice from '../../store/authSlice'
import locationSlice from '../../store/locationSlice'
import privacySlice from '../../store/privacySlice'
import contactsSlice from '../../store/contactsSlice'
import messagingSlice from '../../store/messagingSlice'
import tutorialSlice from '../../store/tutorialSlice'
import { AuthProvider, useAuth } from '../../services/AuthService'
import { supabase, testSupabaseConnection } from '../../lib/supabase'

// Mock at the Supabase boundary — NOT AuthService
jest.mock('../../lib/supabase')
jest.mock('../../services/GoogleSignInService', () => ({
  GoogleSignInService: {
    isAvailable: jest.fn().mockReturnValue(false),
    configure: jest.fn().mockResolvedValue(false),
    signIn: jest.fn().mockResolvedValue({ error: 'Not available' }),
  },
}))
jest.mock('../../services/TwitterSignInService', () => ({
  TwitterSignInService: {
    configure: jest.fn(),
    signIn: jest.fn().mockResolvedValue({ error: 'Not available' }),
  },
}))
jest.mock('../../services/AppleSignInService', () => ({
  AppleSignInService: {
    isAvailable: jest.fn().mockResolvedValue(false),
    signIn: jest.fn().mockResolvedValue({ error: 'Not available' }),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockTestConnection = testSupabaseConnection as jest.MockedFunction<typeof testSupabaseConnection>

function createTestStore(overrides: any = {}) {
  return configureStore({
    reducer: {
      auth: authSlice,
      location: locationSlice,
      privacy: privacySlice,
      contacts: contactsSlice,
      messaging: messagingSlice,
      tutorial: tutorialSlice,
    },
    preloadedState: {
      auth: {
        user: null,
        session: null,
        loading: true,
        isAuthenticated: false,
        ...overrides.auth,
      },
      location: {
        currentLocation: null,
        isTracking: false,
        hasPermission: false,
        trackingAccuracy: 'medium' as const,
        updateInterval: 30000,
        locationHistory: [],
        backgroundTracking: false,
        ...overrides.location,
      },
      privacy: {
        shareLocation: true,
        privacyLevel: 'everyone' as const,
        ghostMode: { enabled: false },
        allowedContacts: [],
        blockedContacts: [],
        showPreciseLocation: true,
        shareLocationHistory: true,
        allowStrangerMessages: true,
        showOnlineStatus: true,
        notifications: {
          pushEnabled: true,
          locationUpdates: true,
          friendRequests: true,
          messages: true,
        },
        ...overrides.privacy,
      },
      contacts: {
        contacts: [],
        searchQuery: '',
        pendingRequests: [],
        blockedUsers: [],
        nearbyContacts: [],
        loadingContacts: false,
        contactUpdates: 0,
        ...overrides.contacts,
      },
      messaging: {
        chatRooms: [],
        messages: {},
        currentChatRoom: null,
        loadingMessages: false,
        loadingChatRooms: false,
        totalUnreadCount: 0,
        typingUsers: {},
        ...overrides.messaging,
      },
      tutorial: {
        hasCompletedOnboarding: false,
        lastCompletedStep: -1,
        tutorialVisible: false,
        firstTimeUser: true,
        ...overrides.tutorial,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })
}

// Test component that exposes auth methods
function AuthTestHarness({ onResult }: { onResult: (result: any) => void }) {
  const auth = useAuth()
  const [lastResult, setLastResult] = useState<any>(null)

  const callMethod = async (method: string, ...args: any[]) => {
    const result = await (auth as any)[method](...args)
    setLastResult(result)
    onResult(result)
  }

  return (
    <View>
      <Text testID="result">{JSON.stringify(lastResult)}</Text>
      <TouchableOpacity testID="signIn" onPress={() => callMethod('signIn', 'test@example.com', 'password123')} />
      <TouchableOpacity testID="signUp" onPress={() => callMethod('signUp', 'new@example.com', 'password123', 'newuser', 'New User')} />
      <TouchableOpacity testID="signOut" onPress={() => callMethod('signOut')} />
      <TouchableOpacity testID="resetPassword" onPress={() => callMethod('resetPassword', 'test@example.com')} />
    </View>
  )
}

function renderWithAuth(onResult: (r: any) => void, storeOverrides: any = {}) {
  const store = createTestStore(storeOverrides)
  const utils = render(
    <Provider store={store}>
      <AuthProvider>
        <AuthTestHarness onResult={onResult} />
      </AuthProvider>
    </Provider>
  )
  return { ...utils, store }
}

describe('Email Auth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no session, subscription stub
    ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    })
    ;(mockSupabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
    ;(mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    })
    mockTestConnection.mockResolvedValue(true)
  })

  describe('signIn', () => {
    it('returns no error on successful email sign-in', async () => {
      const mockSession = {
        access_token: 'tok-123',
        refresh_token: 'ref-123',
        user: { id: 'user-1', email: 'test@example.com' },
      }

      ;(mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' }, session: mockSession },
        error: null,
      })

      // Connection test mock (testConnection calls supabase.from('users').select('count').limit(1))
      const fromChain = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [{ count: 1 }], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signIn'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toBeUndefined()
      })

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns error for invalid credentials', async () => {
      ;(mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      const fromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        limit: jest.fn().mockResolvedValue({ data: [{ count: 1 }], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signIn'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('Invalid email or password')
      })
    })

    it('suggests OAuth sign-in when user exists but password fails', async () => {
      // First call: password fails
      ;(mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      // User exists in the users table, but OAuth passwords also fail
      const existingUser = { id: 'user-1', email: 'test@example.com', username: 'testuser' }
      const fromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: existingUser, error: null }),
        limit: jest.fn().mockResolvedValue({ data: [{ count: 1 }], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signIn'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('Google or Twitter')
      })
    })

    it('returns connection error when server is unreachable', async () => {
      // Connection test fails
      const fromChain = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'connection failed' } }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signIn'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('Cannot connect to server')
      })
    })

    it('handles email not confirmed error', async () => {
      const fromChain = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [{ count: 1 }], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      ;(mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed' },
      })

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signIn'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('confirmation link')
      })
    })
  })

  describe('signUp', () => {
    it('creates a new user successfully', async () => {
      mockTestConnection.mockResolvedValue(true)

      // Username check: not taken
      const fromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      // Auth signUp returns user + session
      ;(mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'new-user-1', email: 'new@example.com', email_confirmed_at: '2026-01-01' },
          session: { access_token: 'tok', user: { id: 'new-user-1' } },
        },
        error: null,
      })

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signUp'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toBeUndefined()
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'newuser',
            display_name: 'New User',
          },
        },
      })
    })

    it('returns error when username is already taken', async () => {
      mockTestConnection.mockResolvedValue(true)

      const fromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { username: 'newuser' },
          error: null,
        }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signUp'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('Username is already taken')
      })
    })

    it('returns error when email is already registered', async () => {
      mockTestConnection.mockResolvedValue(true)

      const fromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      ;(mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      })

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signUp'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('already registered')
      })
    })

    it('returns email confirmation required when no session', async () => {
      mockTestConnection.mockResolvedValue(true)

      const fromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      ;(mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'new-1', email: 'new@example.com', email_confirmed_at: null },
          session: null,
        },
        error: null,
      })

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signUp'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('check your email')
      })
    })

    it('returns connection error when server is unreachable', async () => {
      mockTestConnection.mockResolvedValue(false)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signUp'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toContain('Cannot connect to server')
      })
    })
  })

  describe('signOut', () => {
    it('signs out successfully', async () => {
      ;(mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null })

      const fromChain = {
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signOut'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toBeUndefined()
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('returns error when sign out fails', async () => {
      ;(mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Sign out failed' },
      })

      const fromChain = {
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('signOut'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toBe('Sign out failed')
      })
    })
  })

  describe('resetPassword', () => {
    it('sends reset email successfully', async () => {
      ;(mockSupabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null })

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('resetPassword'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toBeUndefined()
      })

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'tribefind://reset-password' }
      )
    })

    it('returns error when reset fails', async () => {
      ;(mockSupabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: { message: 'Rate limit exceeded' },
      })

      let result: any = null
      const { getByTestId } = renderWithAuth((r) => { result = r })

      await act(async () => {
        fireEvent.press(getByTestId('resetPassword'))
      })

      await waitFor(() => {
        expect(result).toBeDefined()
        expect(result.error).toBe('Rate limit exceeded')
      })
    })
  })

  describe('session initialization', () => {
    it('dispatches clearAuth when no initial session exists', async () => {
      ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const store = createTestStore()
      render(
        <Provider store={store}>
          <AuthProvider>
            <Text>Test</Text>
          </AuthProvider>
        </Provider>
      )

      await waitFor(() => {
        const state = store.getState().auth
        expect(state.loading).toBe(false)
        expect(state.isAuthenticated).toBe(false)
      })
    })

    it('fetches user profile when initial session exists', async () => {
      const mockSession = {
        access_token: 'tok-1',
        user: { id: 'user-1', email: 'test@example.com', user_metadata: {} },
      }
      const mockProfile = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar: null,
        bio: null,
        snap_score: 10,
        is_online: true,
      }

      ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const fromChain = {
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }
      ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

      const store = createTestStore()
      render(
        <Provider store={store}>
          <AuthProvider>
            <Text>Test</Text>
          </AuthProvider>
        </Provider>
      )

      await waitFor(() => {
        const state = store.getState().auth
        expect(state.isAuthenticated).toBe(true)
        expect(state.user?.username).toBe('testuser')
        expect(state.loading).toBe(false)
      })
    })
  })
})
