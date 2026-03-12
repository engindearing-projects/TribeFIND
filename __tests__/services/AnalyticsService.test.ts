// Unmock AnalyticsService so we test the real implementation
jest.unmock('../../services/AnalyticsService')

// Mock SentryService - use inline object to avoid hoisting issues
jest.mock('../../services/SentryService', () => ({
  SentryService: {
    initialize: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
    addBreadcrumb: jest.fn(),
    isInitialized: jest.fn().mockReturnValue(true),
    wrap: jest.fn((c: any) => c),
  },
}))

// Also mock @sentry/react-native since SentryService imports it
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn((c: any) => c),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
}))

import { AnalyticsService } from '../../services/AnalyticsService'
import { SentryService } from '../../services/SentryService'

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global as any).__DEV__ = true
  })

  describe('trackEvent', () => {
    it('adds a breadcrumb via SentryService', () => {
      AnalyticsService.trackEvent('screen_view', { screen: 'Home' })
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'screen_view',
        { screen: 'Home' }
      )
    })
  })

  describe('trackScreenView', () => {
    it('tracks screen view with screen name', () => {
      AnalyticsService.trackScreenView('ProfileScreen')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'screen_view',
        { screen: 'ProfileScreen' }
      )
    })
  })

  describe('trackSignUp', () => {
    it('tracks email sign up', () => {
      AnalyticsService.trackSignUp('email')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'sign_up',
        { method: 'email' }
      )
    })

    it('tracks google sign up', () => {
      AnalyticsService.trackSignUp('google')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'sign_up',
        { method: 'google' }
      )
    })
  })

  describe('trackSignIn', () => {
    it('tracks email sign in', () => {
      AnalyticsService.trackSignIn('email')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'sign_in',
        { method: 'email' }
      )
    })

    it('tracks google sign in with specific event', () => {
      AnalyticsService.trackSignIn('google')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'sign_in_google',
        { method: 'google' }
      )
    })

    it('tracks twitter sign in with specific event', () => {
      AnalyticsService.trackSignIn('twitter')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'sign_in_twitter',
        { method: 'twitter' }
      )
    })

    it('tracks apple sign in with specific event', () => {
      AnalyticsService.trackSignIn('apple')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'sign_in_apple',
        { method: 'apple' }
      )
    })
  })

  describe('trackSignOut', () => {
    it('tracks sign out event', () => {
      AnalyticsService.trackSignOut()
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'sign_out',
        undefined
      )
    })
  })

  describe('trackStoryCreated', () => {
    it('tracks image story creation', () => {
      AnalyticsService.trackStoryCreated('image')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'story_created',
        { media_type: 'image' }
      )
    })

    it('tracks video story creation', () => {
      AnalyticsService.trackStoryCreated('video')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'story_created',
        { media_type: 'video' }
      )
    })
  })

  describe('trackStoryViewed', () => {
    it('tracks story view with ID', () => {
      AnalyticsService.trackStoryViewed('story-123')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'story_viewed',
        { story_id: 'story-123' }
      )
    })
  })

  describe('trackStoryDeleted', () => {
    it('tracks story deletion with ID', () => {
      AnalyticsService.trackStoryDeleted('story-456')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'story_deleted',
        { story_id: 'story-456' }
      )
    })
  })

  describe('trackChatMessageSent', () => {
    it('tracks chat message with room ID', () => {
      AnalyticsService.trackChatMessageSent('room-789')
      expect(SentryService.addBreadcrumb).toHaveBeenCalledWith(
        'analytics',
        'chat_message_sent',
        { chat_room_id: 'room-789' }
      )
    })
  })

  describe('trackError', () => {
    it('captures exception via SentryService', () => {
      const error = new Error('something broke')
      AnalyticsService.trackError(error, { screen: 'Chat' })
      expect(SentryService.captureException).toHaveBeenCalledWith(
        error,
        { screen: 'Chat' }
      )
    })
  })

  describe('setUser', () => {
    it('sets user on SentryService', () => {
      const user = { id: 'u1', email: 'a@b.com', username: 'alice' }
      AnalyticsService.setUser(user)
      expect(SentryService.setUser).toHaveBeenCalledWith(user)
    })

    it('clears user with null', () => {
      AnalyticsService.setUser(null)
      expect(SentryService.setUser).toHaveBeenCalledWith(null)
    })
  })
})
