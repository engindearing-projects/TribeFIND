import notificationReducer, {
  setPushToken,
  setTokenRegistered,
  setPermissionStatus,
  clearNotificationState,
} from '../../store/notificationSlice';

describe('notificationSlice', () => {
  const initialState = {
    pushToken: null,
    tokenRegistered: false,
    permissionStatus: 'undetermined' as const,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = notificationReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start with no push token', () => {
      const state = notificationReducer(undefined, { type: 'unknown' });
      expect(state.pushToken).toBeNull();
    });

    it('should start with token not registered', () => {
      const state = notificationReducer(undefined, { type: 'unknown' });
      expect(state.tokenRegistered).toBe(false);
    });

    it('should start with undetermined permission status', () => {
      const state = notificationReducer(undefined, { type: 'unknown' });
      expect(state.permissionStatus).toBe('undetermined');
    });
  });

  describe('setPushToken', () => {
    it('should set a push token', () => {
      const token = 'ExponentPushToken[abc123]';
      const state = notificationReducer(initialState, setPushToken(token));
      expect(state.pushToken).toBe(token);
    });

    it('should clear push token with null', () => {
      const stateWithToken = { ...initialState, pushToken: 'ExponentPushToken[abc123]' };
      const state = notificationReducer(stateWithToken, setPushToken(null));
      expect(state.pushToken).toBeNull();
    });

    it('should replace existing token', () => {
      const stateWithToken = { ...initialState, pushToken: 'ExponentPushToken[old]' };
      const state = notificationReducer(stateWithToken, setPushToken('ExponentPushToken[new]'));
      expect(state.pushToken).toBe('ExponentPushToken[new]');
    });
  });

  describe('setTokenRegistered', () => {
    it('should mark token as registered', () => {
      const state = notificationReducer(initialState, setTokenRegistered(true));
      expect(state.tokenRegistered).toBe(true);
    });

    it('should mark token as not registered', () => {
      const stateRegistered = { ...initialState, tokenRegistered: true };
      const state = notificationReducer(stateRegistered, setTokenRegistered(false));
      expect(state.tokenRegistered).toBe(false);
    });
  });

  describe('setPermissionStatus', () => {
    it('should set to granted', () => {
      const state = notificationReducer(initialState, setPermissionStatus('granted'));
      expect(state.permissionStatus).toBe('granted');
    });

    it('should set to denied', () => {
      const state = notificationReducer(initialState, setPermissionStatus('denied'));
      expect(state.permissionStatus).toBe('denied');
    });

    it('should set to undetermined', () => {
      const stateGranted = { ...initialState, permissionStatus: 'granted' as const };
      const state = notificationReducer(stateGranted, setPermissionStatus('undetermined'));
      expect(state.permissionStatus).toBe('undetermined');
    });
  });

  describe('clearNotificationState', () => {
    it('should reset all state to initial values', () => {
      const populatedState = {
        pushToken: 'ExponentPushToken[abc123]',
        tokenRegistered: true,
        permissionStatus: 'granted' as const,
      };
      const state = notificationReducer(populatedState, clearNotificationState());
      expect(state).toEqual(initialState);
    });

    it('should not affect already initial state', () => {
      const state = notificationReducer(initialState, clearNotificationState());
      expect(state).toEqual(initialState);
    });
  });
});
