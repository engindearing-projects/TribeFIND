import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Override the global mock for these tests so we can test the actual service logic
jest.unmock('../../services/NotificationService');

// We need to mock the store before importing the service
const mockDispatch = jest.fn();
const mockGetState = jest.fn();
jest.mock('../../store', () => ({
  store: {
    dispatch: (...args: any[]) => mockDispatch(...args),
    getState: () => mockGetState(),
  },
}));

import { NotificationService } from '../../services/NotificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({
      privacy: {
        notifications: {
          pushEnabled: true,
          locationUpdates: true,
          friendRequests: true,
          messages: true,
        },
      },
    });
  });

  afterEach(() => {
    NotificationService.cleanup();
  });

  describe('requestPermissions', () => {
    it('should request permissions on a physical device', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

      const result = await NotificationService.requestPermissions();
      expect(result).toBe(true);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should return false when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const result = await NotificationService.requestPermissions();
      expect(result).toBe(false);
    });

    it('should request permission if not already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

      const result = await NotificationService.requestPermissions();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permission denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const result = await NotificationService.requestPermissions();
      expect(result).toBe(false);
    });
  });

  describe('registerForPushNotifications', () => {
    it('should return a push token when permissions are granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[test-token]',
      });

      const token = await NotificationService.registerForPushNotifications();
      expect(token).toBe('ExponentPushToken[test-token]');
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should return null when permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const token = await NotificationService.registerForPushNotifications();
      expect(token).toBeNull();
    });
  });

  describe('setupListeners', () => {
    it('should register notification listeners', () => {
      NotificationService.setupListeners();
      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });

    it('should clean up previous listeners before setting new ones', () => {
      const mockRemove = jest.fn();
      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemove });
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemove });

      NotificationService.setupListeners();
      NotificationService.setupListeners();

      expect(mockRemove).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('should remove all listeners', () => {
      const mockRemove = jest.fn();
      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemove });
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemove });

      NotificationService.setupListeners();
      NotificationService.cleanup();

      expect(mockRemove).toHaveBeenCalledTimes(2);
    });
  });
});
