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
import { TwitterSignInService } from '../../services/TwitterSignInService'

jest.mock('../../lib/supabase')
jest.mock('../../services/TwitterSignInService')
jest.mock('../../services/GoogleSignInService', () => ({
  GoogleSignInService: {
    isAvailable: jest.fn().mockReturnValue(false),
    configure: jest.fn().mockResolvedValue(false),
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
const mockTwitterSignIn = TwitterSignInService as jest.Mocked<typeof TwitterSignInService>

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

function TwitterAuthHarness({ onResult }: { onResult: (r: any) => void }) {
  const auth = useAuth()
  return (
    <View>
      <TouchableOpacity testID="twitterSignIn" onPress={async () => {
        const result = await auth.signInWithTwitter()
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
        <TwitterAuthHarness onResult={onResult} />
      </AuthProvider>
    </Provider>
  )
  return { ...utils, store }
}

describe('Twitter Auth Integration', () => {
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

  it('completes full Twitter PKCE sign-in flow for a new user', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(true)
    ;(mockTwitterSignIn.signIn as jest.Mock).mockResolvedValue({
      success: true,
      user: {
        id: 'tw-123456',
        name: 'Twitter User',
        username: 'twitteruser',
        email: 'twitter@example.com',
        profile_image_url: 'https://pbs.twimg.com/profile/avatar.jpg',
        verified: false,
        public_metrics: { followers_count: 100, following_count: 50 },
      },
      accessToken: 'twitter-access-token-abc',
    })

    // No existing user
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
        user: { id: 'tw-auth-1', email: 'twitter@example.com' },
        session: { access_token: 'tok', user: { id: 'tw-auth-1' } },
      },
      error: null,
    })

    ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'tw-auth-1', email: 'twitter@example.com' },
        },
      },
      error: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    expect(mockTwitterSignIn.configure).toHaveBeenCalled()
    expect(mockTwitterSignIn.signIn).toHaveBeenCalled()
  })

  it('returns error when Twitter configuration fails', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(false)

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('not properly configured')
    })
  })

  it('returns error when Twitter sign-in fails', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(true)
    ;(mockTwitterSignIn.signIn as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Authorization was denied by the user',
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('denied')
    })
  })

  it('returns error when Twitter returns no user data', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(true)
    ;(mockTwitterSignIn.signIn as jest.Mock).mockResolvedValue({
      success: true,
      user: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('No user information')
    })
  })

  it('uses placeholder email when Twitter user has no email', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(true)
    ;(mockTwitterSignIn.signIn as jest.Mock).mockResolvedValue({
      success: true,
      user: {
        id: 'tw-no-email',
        name: 'No Email User',
        username: 'noemail',
        email: null, // Twitter doesn't always provide email
        profile_image_url: null,
      },
      accessToken: 'tw-tok',
    })

    // No existing user
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
        user: { id: 'tw-auth-2', email: 'noemail@twitter.placeholder' },
        session: { access_token: 'tok', user: { id: 'tw-auth-2' } },
      },
      error: null,
    })

    ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'tw-auth-2', email: 'noemail@twitter.placeholder' },
        },
      },
      error: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    // Verify placeholder email was used
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'noemail@twitter.placeholder',
        password: 'twitter-oauth-user',
      })
    )
  })

  it('signs in existing user via Twitter OAuth', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(true)
    ;(mockTwitterSignIn.signIn as jest.Mock).mockResolvedValue({
      success: true,
      user: {
        id: 'tw-existing',
        name: 'Existing Twitter',
        username: 'existingtwitter',
        email: 'existing@example.com',
        profile_image_url: 'https://pbs.twimg.com/pic.jpg',
      },
      accessToken: 'tw-tok-existing',
    })

    const existingUser = {
      id: 'existing-1',
      email: 'existing@example.com',
      username: 'existinguser',
      display_name: 'Existing User',
      bio: 'old bio',
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
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  it('handles unexpected errors gracefully', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(true)
    ;(mockTwitterSignIn.signIn as jest.Mock).mockRejectedValue(new Error('PKCE verification failed'))

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('unexpected error')
    })
  })

  it('passes Twitter user data including username to createOrSignInUser', async () => {
    ;(mockTwitterSignIn.configure as jest.Mock).mockReturnValue(true)
    ;(mockTwitterSignIn.signIn as jest.Mock).mockResolvedValue({
      success: true,
      user: {
        id: 'tw-999',
        name: 'Special User',
        username: 'specialtwitter',
        email: 'special@example.com',
        profile_image_url: 'https://img.url/pic.jpg',
        verified: true,
      },
      accessToken: 'tw-special-tok',
    })

    // No existing user — new user flow
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
        user: { id: 'tw-auth-999', email: 'special@example.com' },
        session: { access_token: 'tok', user: { id: 'tw-auth-999' } },
      },
      error: null,
    })

    ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'tw-auth-999', email: 'special@example.com' },
        },
      },
      error: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('twitterSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    // Verify the signUp included twitter provider metadata
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({
            provider: 'twitter',
          }),
        }),
      })
    )
  })
})
