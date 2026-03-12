// Keep mocks at top level so they survive resetModules
const mockInit = jest.fn()
const mockCaptureException = jest.fn()
const mockCaptureMessage = jest.fn()
const mockWithScope = jest.fn((cb: any) => cb({ setExtra: jest.fn() }))
const mockSetUser = jest.fn()
const mockAddBreadcrumb = jest.fn()
const mockWrap = jest.fn((component: any) => component)

jest.mock('@sentry/react-native', () => ({
  init: mockInit,
  wrap: mockWrap,
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  withScope: mockWithScope,
  setUser: mockSetUser,
  addBreadcrumb: mockAddBreadcrumb,
}))

// Unmock the service under test
jest.unmock('../../services/SentryService')

describe('SentryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ;(global as any).__DEV__ = true
  })

  describe('initialize', () => {
    it('does not init without DSN', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = ''
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()
      expect(mockInit).not.toHaveBeenCalled()
    })

    it('calls Sentry.init with correct config when DSN is set', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
        })
      )
    })

    it('only initializes once', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()
      SentryService.initialize()
      expect(mockInit).toHaveBeenCalledTimes(1)
    })
  })

  describe('captureException', () => {
    it('calls Sentry.captureException when initialized', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()

      const error = new Error('test error')
      SentryService.captureException(error)
      expect(mockCaptureException).toHaveBeenCalledWith(error)
    })

    it('uses withScope when context is provided', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()

      const error = new Error('test error')
      SentryService.captureException(error, { screen: 'Home' })
      expect(mockWithScope).toHaveBeenCalled()
    })

    it('does not call Sentry when not initialized', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = ''
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()

      SentryService.captureException(new Error('test'))
      expect(mockCaptureException).not.toHaveBeenCalled()
    })
  })

  describe('setUser', () => {
    it('calls Sentry.setUser with user data', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()

      SentryService.setUser({ id: 'u1', email: 'a@b.com', username: 'alice' })
      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'u1',
        email: 'a@b.com',
        username: 'alice',
      })
    })

    it('clears user with null', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()

      SentryService.setUser(null)
      expect(mockSetUser).toHaveBeenCalledWith(null)
    })
  })

  describe('addBreadcrumb', () => {
    it('adds breadcrumb when initialized', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { SentryService } = require('../../services/SentryService')
      SentryService.initialize()

      SentryService.addBreadcrumb('nav', 'screen change', { screen: 'Home' })
      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: 'nav',
        message: 'screen change',
        data: { screen: 'Home' },
        level: 'info',
      })
    })
  })

  describe('wrap', () => {
    it('exposes Sentry.wrap', () => {
      const { SentryService } = require('../../services/SentryService')
      const component = () => null
      SentryService.wrap(component)
      expect(mockWrap).toHaveBeenCalledWith(component)
    })
  })
})
