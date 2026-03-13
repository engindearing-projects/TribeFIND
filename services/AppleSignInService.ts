import { Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'

export class AppleSignInService {
  static async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios') {
        return false
      }
      return await AppleAuthentication.isAvailableAsync()
    } catch (error) {
      if (__DEV__) console.error('Error checking Apple Sign In availability:', error)
      return false
    }
  }

  static async signIn() {
    try {
      const available = await this.isAvailable()
      if (!available) {
        return { error: 'Apple Sign In is not available on this device. Requires iOS 13+.' }
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (!credential.identityToken) {
        return { error: 'No identity token received from Apple. Please try again.' }
      }

      const userInfo = {
        id: credential.user,
        email: credential.email,
        name: credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : credential.email?.split('@')[0] || 'Apple User',
      }

      return {
        user: userInfo,
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { error: 'Apple Sign In was cancelled.' }
      } else if (error.code === 'ERR_REQUEST_FAILED') {
        return { error: 'Apple Sign In failed. Please check your internet connection.' }
      } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
        return { error: 'Apple Sign In is not properly configured.' }
      }
      if (__DEV__) console.error('Apple Sign In error:', error)
      return { error: error.message || 'Apple Sign In failed. Please try again.' }
    }
  }

  static async signOut() {
    // Apple doesn't provide a sign out method — user revokes from Apple ID settings
    return true
  }

  static async getCredentialState(userID: string) {
    try {
      if (Platform.OS !== 'ios') {
        return AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND
      }
      return await AppleAuthentication.getCredentialStateAsync(userID)
    } catch (error) {
      if (__DEV__) console.error('Error getting Apple credential state:', error)
      return AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND
    }
  }

  static async validateCredential(userID: string): Promise<boolean> {
    try {
      const state = await this.getCredentialState(userID)
      return state === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED
    } catch (error) {
      return false
    }
  }
}
