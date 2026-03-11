import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { TouchableOpacity, View } from 'react-native'
import authSlice from '../../store/authSlice'
import locationSlice from '../../store/locationSlice'
import privacySlice from '../../store/privacySlice'
import contactsSlice from '../../store/contactsSlice'
import messagingSlice from '../../store/messagingSlice'
import tutorialSlice from '../../store/tutorialSlice'
import { AuthProvider, useAuth } from '../../services/AuthService'
import { supabase } from '../../lib/supabase'
import { AppleSignInService } from '../../services/AppleSignInService'

jest.mock('../../lib/supabase')
jest.mock('../../services/AppleSignInService')
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

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockAppleSignIn = AppleSignInService as jest.Mocked<typeof AppleSignInService>

function createTestStore() {
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
      auth: { user: null, session: null, loading: true, isAuthenticated: false },
      location: { currentLocation: null, isTracking: false, hasPermission: false, trackingAccuracy: 'balanced', updateInterval: 30000, locationHistory: [], backgroundTracking: false },
      privacy: { shareLocation: true, privacyLevel: 'everyone', ghostMode: { enabled: false, duration: null }, allowedContacts: [], blockedContacts: [], showPreciseLocation: true, shareLocationHistory: true, allowStrangerMessages: true, showOnlineStatus: true, notifications: { pushEnabled: true, soundEnabled: true, vibrationEnabled: true, friendRequests: true, messages: true, nearbyAlerts: true } },
      contacts: { contacts: [], searchQuery: '', pendingRequests: [], blockedUsers: [], nearbyContacts: [], loadingContacts: false, contactUpdates: 0 },
      messaging: { chatRooms: [], messages: {}, currentChatRoom: null, loadingMessages: false, loadingChatRooms: false, totalUnreadCount: 0, typingUsers: {} },
      tutorial: { hasCompletedOnboarding: false, lastCompletedStep: -1, tutorialVisible: false, firstTimeUser: true },
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  })
}

function AppleAuthHarness({ onResult }: { onResult: (r: any) => void }) {
  const auth = useAuth()
  return (
    <View>
      <TouchableOpacity testID="appleSignIn" onPress={async () => {
        const result = await auth.signInWithApple()
        onResult(result)
      }} />
    </View>
  )
}

function renderWithAuth(onResult: (r: any) => void) {
  const store = createTestStore()
  const utils = render(
    <Provider store={store}>
      <AuthProvider>
        <AppleAuthHarness onResult={onResult} />
      </AuthProvider>
    </Provider>
  )
  return { ...utils, store }
}

describe('Apple Auth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    })
  })

  it('completes full Apple sign-in flow for a new user', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: {
        id: 'apple-user-id-123',
        email: 'apple@example.com',
        name: 'Apple User',
      },
      identityToken: 'apple-identity-token-abc',
      authorizationCode: 'apple-auth-code-xyz',
    })

    // No existing user in DB
    const fromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }
    ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

    ;(mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'apple-auth-1', email: 'apple@example.com' },
        session: { access_token: 'tok', user: { id: 'apple-auth-1' } },
      },
      error: null,
    })

    ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'apple-auth-1', email: 'apple@example.com' },
        },
      },
      error: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    expect(mockAppleSignIn.isAvailable).toHaveBeenCalled()
    expect(mockAppleSignIn.signIn).toHaveBeenCalled()
  })

  it('returns error when Apple Sign-In is not available', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(false)

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('not available')
    })

    expect(mockAppleSignIn.signIn).not.toHaveBeenCalled()
  })

  it('returns error when Apple sign-in fails', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      error: 'The operation was cancelled by the user.',
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('cancelled')
    })
  })

  it('returns error when Apple returns no user data', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: null,
      identityToken: 'token-abc',
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('No user information')
    })
  })

  it('handles hidden email by using Apple ID as email', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: {
        id: 'apple-hidden-id-456',
        email: null, // Apple hides the email
        name: 'Private User',
      },
      identityToken: 'apple-token-def',
    })

    // New user flow
    const fromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }
    ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

    ;(mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'apple-auth-2', email: 'apple-hidden-id-456@privaterelay.appleid.com' },
        session: { access_token: 'tok', user: { id: 'apple-auth-2' } },
      },
      error: null,
    })

    ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'apple-auth-2', email: 'apple-hidden-id-456@privaterelay.appleid.com' },
        },
      },
      error: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    // Verify signUp was called with the privaterelay email
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'apple-hidden-id-456@privaterelay.appleid.com',
        password: 'apple-oauth-user',
      })
    )
  })

  it('signs in existing user via Apple', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: {
        id: 'apple-existing-id',
        email: 'existing@example.com',
        name: 'Existing Apple User',
      },
      identityToken: 'apple-token-existing',
    })

    // Existing user found
    const existingUser = {
      id: 'existing-1',
      email: 'existing@example.com',
      username: 'existinguser',
      display_name: 'Existing User',
    }
    const fromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: existingUser, error: null }),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }
    ;(mockSupabase.from as jest.Mock).mockReturnValue(fromChain)

    ;(mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'existing-1', email: 'existing@example.com' },
        session: { access_token: 'tok' },
      },
      error: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  it('handles unexpected errors gracefully', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockRejectedValue(new Error('System error'))

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('unexpected error')
    })
  })
})
