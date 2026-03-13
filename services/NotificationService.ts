import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { store } from '../store'
import { setPushToken, setTokenRegistered, setPermissionStatus } from '../store/notificationSlice'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const state = store.getState()
    const prefs = state.privacy.notifications

    if (!prefs.pushEnabled) {
      return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: false, shouldShowList: false }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }
  },
})

export class NotificationService {
  private static notificationListener: Notifications.EventSubscription | null = null
  private static responseListener: Notifications.EventSubscription | null = null

  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device')
      store.dispatch(setPermissionStatus('denied'))
      return false
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted')
      store.dispatch(setPermissionStatus('denied'))
      return false
    }

    store.dispatch(setPermissionStatus('granted'))

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
      })
    }

    return true
  }

  static async registerForPushNotifications(): Promise<string | null> {
    const permitted = await this.requestPermissions()
    if (!permitted) return null

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'ba3ffb98-85fc-4e78-9521-90e52f842751',
      })
      const token = tokenData.data
      console.log('Push token:', token)

      store.dispatch(setPushToken(token))
      return token
    } catch (error) {
      console.error('Failed to get push token:', error)
      return null
    }
  }

  static async savePushTokenToProfile(userId: string, token: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', userId)

      if (error) {
        console.error('Failed to save push token:', error.message)
        return { error: error.message }
      }

      store.dispatch(setTokenRegistered(true))
      console.log('Push token saved to profile')
      return {}
    } catch (error: any) {
      console.error('Error saving push token:', error.message)
      return { error: error.message }
    }
  }

  static async initialize(userId?: string): Promise<void> {
    const token = await this.registerForPushNotifications()

    if (token && userId) {
      await this.savePushTokenToProfile(userId, token)
    }

    this.setupListeners()
  }

  static setupListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove()
    }
    if (this.responseListener) {
      this.responseListener.remove()
    }

    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      const state = store.getState()
      const prefs = state.privacy.notifications
      const categoryId = notification.request.content.categoryIdentifier

      if (categoryId === 'location' && !prefs.locationUpdates) return
      if (categoryId === 'friend_request' && !prefs.friendRequests) return
      if (categoryId === 'message' && !prefs.messages) return

      console.log('Notification received:', notification.request.content.title)
    })

    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      console.log('Notification tapped:', data)
    })
  }

  static cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove()
      this.notificationListener = null
    }
    if (this.responseListener) {
      this.responseListener.remove()
      this.responseListener = null
    }
  }
}
