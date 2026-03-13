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
      location: { currentLocation: null, isTracking: false, hasPermission: false, trackingAccuracy: 'medium' as const, updateInterval: 30000, locationHistory: [], backgroundTracking: false },
      privacy: { shareLocation: true, privacyLevel: 'everyone' as const, ghostMode: { enabled: false }, allowedContacts: [], blockedContacts: [], showPreciseLocation: true, shareLocationHistory: true, allowStrangerMessages: true, showOnlineStatus: true, notifications: { pushEnabled: true, locationUpdates: true, friendRequests: true, messages: true } },
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

  it('completes full Apple sign-in flow using signInWithIdToken', async () => {
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

    ;(mockSupabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'apple-auth-1', email: 'apple@example.com' },
        session: { access_token: 'tok', user: { id: 'apple-auth-1' } },
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
    expect(mockSupabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'apple',
      token: 'apple-identity-token-abc',
    })
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
      error: 'Apple Sign In was cancelled.',
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

  it('returns error when no identity token received', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: { id: 'apple-id', email: 'test@example.com', name: 'Test' },
      identityToken: null,
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('identity token')
    })
  })

  it('returns error when Supabase signInWithIdToken fails', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: { id: 'apple-id', email: 'test@example.com', name: 'Test' },
      identityToken: 'valid-token',
      authorizationCode: 'auth-code',
    })

    ;(mockSupabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid token' },
    })

    let result: any = null
    const { findByTestId } = renderWithAuth((r) => { result = r })

    await act(async () => {
      const btn = await findByTestId('appleSignIn')
      fireEvent.press(btn)
    })

    await waitFor(() => {
      expect(result).toBeDefined()
      expect(result.error).toContain('Invalid token')
    })
  })

  it('handles hidden email (uses signInWithIdToken regardless)', async () => {
    ;(mockAppleSignIn.isAvailable as jest.Mock).mockResolvedValue(true)
    ;(mockAppleSignIn.signIn as jest.Mock).mockResolvedValue({
      user: {
        id: 'apple-hidden-id-456',
        email: null,
        name: 'Private User',
      },
      identityToken: 'apple-token-def',
      authorizationCode: 'auth-code',
    })

    ;(mockSupabase.auth.signInWithIdToken as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'apple-auth-2', email: 'apple-hidden-id-456@privaterelay.appleid.com' },
        session: { access_token: 'tok', user: { id: 'apple-auth-2' } },
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

    // signInWithIdToken handles hidden emails server-side
    expect(mockSupabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'apple',
      token: 'apple-token-def',
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
