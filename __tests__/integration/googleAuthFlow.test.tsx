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
import { GoogleSignInService } from '../../services/GoogleSignInService'

jest.mock('../../lib/supabase')
jest.mock('../../services/GoogleSignInService')
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
const mockGoogleSignIn = GoogleSignInService as jest.Mocked<typeof GoogleSignInService>

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
      location: { currentLocation: null, isTracking: false, hasPermission: false, trackingAccuracy: 'medium' as const, updateInterval: 30000, locationHistory: [], backgroundTracking: false },
      privacy: { shareLocation: true, privacyLevel: 'everyone' as const, ghostMode: { enabled: false }, allowedContacts: [], blockedContacts: [], showPreciseLocation: true, shareLocationHistory: true, allowStrangerMessages: true, showOnlineStatus: true, notifications: { pushEnabled: true, locationUpdates: true, friendRequests: true, messages: true } },
      contacts: { contacts: [], searchQuery: '', pendingRequests: [], blockedUsers: [], nearbyContacts: [], loadingContacts: false, contactUpdates: 0 },
      messaging: { chatRooms: [], messages: {}, currentChatRoom: null, loadingMessages: false, loadingChatRooms: false, totalUnreadCount: 0, typingUsers: {} },
      tutorial: { hasCompletedOnboarding: false, lastCompletedStep: -1, tutorialVisible: false, firstTimeUser: true },
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  })
}

function GoogleAuthHarness({ onResult }: { onResult: (r: any) => void }) {
  const auth = useAuth()
  return (
    <View>
      <TouchableOpacity testID="googleSignIn" onPress={async () => {
        const result = await auth.signInWithGoogle()
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
        <GoogleAuthHarness onResult={onResult} />
      </AuthProvider>
    </Provider>
  )
  return { ...utils, store }
}

describe('Google Auth Integration', () => {
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

  it('completes full Google sign-in flow for a new user', async () => {
    // Google SDK returns user info
    ;(mockGoogleSignIn.configure as jest.Mock).mockResolvedValue(true)
    ;(mockGoogleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: {
        email: 'google@example.com',
        name: 'Google User',
        photo: 'https://photo.url/avatar.jpg',
      },
      idToken: 'google-id-token-123',
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

    // Auth signUp for new OAuth user
    ;(mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'google-user-1', email: 'google@example.com' },
        session: { access_token: 'tok', user: { id: 'google-user-1' } },
      },
      error: null,
    })

    // getSession after signUp
    ;(mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'google-user-1', email: 'google@example.com' },
        },
      },
      error: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('googleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    expect(mockGoogleSignIn.configure).toHaveBeenCalled()
    expect(mockGoogleSignIn.signIn).toHaveBeenCalled()
  })

  it('returns error when Google configuration fails', async () => {
    ;(mockGoogleSignIn.configure as jest.Mock).mockResolvedValue(false)

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('googleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('not properly configured')
    })
  })

  it('returns error when Google sign-in returns an error', async () => {
    ;(mockGoogleSignIn.configure as jest.Mock).mockResolvedValue(true)
    ;(mockGoogleSignIn.signIn as jest.Mock).mockResolvedValue({
      error: 'User cancelled the sign-in flow',
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('googleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('cancelled')
    })
  })

  it('returns error when Google returns no user data', async () => {
    ;(mockGoogleSignIn.configure as jest.Mock).mockResolvedValue(true)
    ;(mockGoogleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('googleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('No user information')
    })
  })

  it('signs in existing user via Google OAuth', async () => {
    ;(mockGoogleSignIn.configure as jest.Mock).mockResolvedValue(true)
    ;(mockGoogleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: {
        email: 'existing@example.com',
        name: 'Existing User',
        photo: null,
      },
    })

    // Existing user found in DB
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

    // signInWithPassword succeeds with OAuth password
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
      const btn = await findByTestId('googleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  it('handles unexpected errors gracefully', async () => {
    ;(mockGoogleSignIn.configure as jest.Mock).mockResolvedValue(true)
    ;(mockGoogleSignIn.signIn as jest.Mock).mockRejectedValue(new Error('Network timeout'))

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('googleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('unexpected error')
    })
  })
})
