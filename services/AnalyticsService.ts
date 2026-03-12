import { SentryService } from './SentryService'

export type AnalyticsEvent =
  | 'screen_view'
  | 'sign_up'
  | 'sign_in'
  | 'sign_out'
  | 'sign_in_google'
  | 'sign_in_twitter'
  | 'sign_in_apple'
  | 'story_created'
  | 'story_viewed'
  | 'story_deleted'
  | 'chat_message_sent'
  | 'push_notification_registered'
  | 'push_notification_received'
  | 'error_occurred'

export class AnalyticsService {
  static trackEvent(event: AnalyticsEvent, properties?: Record<string, any>): void {
    SentryService.addBreadcrumb('analytics', event, properties)

    if (__DEV__) {
      console.log(`[Analytics] ${event}`, properties || '')
    }
  }

  static trackScreenView(screenName: string): void {
    this.trackEvent('screen_view', { screen: screenName })
  }

  static trackSignUp(method: 'email' | 'google' | 'twitter' | 'apple'): void {
    this.trackEvent('sign_up', { method })
  }

  static trackSignIn(method: 'email' | 'google' | 'twitter' | 'apple'): void {
    const eventMap: Record<string, AnalyticsEvent> = {
      email: 'sign_in',
      google: 'sign_in_google',
      twitter: 'sign_in_twitter',
      apple: 'sign_in_apple',
    }
    this.trackEvent(eventMap[method] || 'sign_in', { method })
  }

  static trackSignOut(): void {
    this.trackEvent('sign_out')
  }

  static trackStoryCreated(mediaType: 'image' | 'video'): void {
    this.trackEvent('story_created', { media_type: mediaType })
  }

  static trackStoryViewed(storyId: string): void {
    this.trackEvent('story_viewed', { story_id: storyId })
  }

  static trackStoryDeleted(storyId: string): void {
    this.trackEvent('story_deleted', { story_id: storyId })
  }

  static trackChatMessageSent(chatRoomId: string): void {
    this.trackEvent('chat_message_sent', { chat_room_id: chatRoomId })
  }

  static trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent('error_occurred', {
      error_message: error.message,
      ...context,
    })
    SentryService.captureException(error, context)
  }

  static setUser(user: { id: string; email?: string; username?: string } | null): void {
    SentryService.setUser(user)
  }
}
