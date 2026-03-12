import * as Sentry from '@sentry/react-native'

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || ''

export class SentryService {
  private static initialized = false

  static initialize(): void {
    if (this.initialized) return

    if (!SENTRY_DSN) {
      console.log('Sentry DSN not configured, error tracking disabled')
      return
    }

    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        debug: __DEV__,
        enabled: !__DEV__,
        tracesSampleRate: 1.0,
        environment: __DEV__ ? 'development' : 'production',
      })
      this.initialized = true
      console.log('Sentry initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Sentry:', error)
    }
  }

  static captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized) {
      console.error('Sentry not initialized, logging error:', error.message)
      return
    }

    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value)
        })
        Sentry.captureException(error)
      })
    } else {
      Sentry.captureException(error)
    }
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.initialized) return
    Sentry.captureMessage(message, level)
  }

  static setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (!this.initialized) return

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      })
    } else {
      Sentry.setUser(null)
    }
  }

  static addBreadcrumb(
    category: string,
    message: string,
    data?: Record<string, any>,
    level: Sentry.SeverityLevel = 'info'
  ): void {
    if (!this.initialized) return
    Sentry.addBreadcrumb({ category, message, data, level })
  }

  static isInitialized(): boolean {
    return this.initialized
  }

  /** Wrap the root component with Sentry's error boundary */
  static wrap = Sentry.wrap
}
