import privacyReducer, {
  setShareLocation,
  setPrivacyLevel,
  setGhostMode,
  addAllowedContact,
  removeAllowedContact,
  addBlockedContact,
  removeBlockedContact,
  setShowPreciseLocation,
  setShareLocationHistory,
  setAllowStrangerMessages,
  setShowOnlineStatus,
  updateNotifications,
} from '../../store/privacySlice';

describe('privacySlice', () => {
  const initialState = {
    shareLocation: false,
    privacyLevel: 'friends' as const,
    ghostMode: {
      enabled: false,
    },
    allowedContacts: [],
    blockedContacts: [],
    showPreciseLocation: true,
    shareLocationHistory: false,
    allowStrangerMessages: false,
    showOnlineStatus: true,
    notifications: {
      pushEnabled: true,
      locationUpdates: true,
      friendRequests: true,
      messages: true,
    },
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = privacyReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start with location sharing disabled', () => {
      const state = privacyReducer(undefined, { type: 'unknown' });
      expect(state.shareLocation).toBe(false);
    });

    it('should start with friends privacy level', () => {
      const state = privacyReducer(undefined, { type: 'unknown' });
      expect(state.privacyLevel).toBe('friends');
    });
  });

  describe('setShareLocation', () => {
    it('should enable location sharing', () => {
      const state = privacyReducer(initialState, setShareLocation(true));
      expect(state.shareLocation).toBe(true);
    });

    it('should disable location sharing', () => {
      const state = privacyReducer({ ...initialState, shareLocation: true }, setShareLocation(false));
      expect(state.shareLocation).toBe(false);
    });
  });

  describe('setPrivacyLevel', () => {
    it('should set to everyone', () => {
      const state = privacyReducer(initialState, setPrivacyLevel('everyone'));
      expect(state.privacyLevel).toBe('everyone');
    });

    it('should set to custom', () => {
      const state = privacyReducer(initialState, setPrivacyLevel('custom'));
      expect(state.privacyLevel).toBe('custom');
    });

    it('should set to nobody', () => {
      const state = privacyReducer(initialState, setPrivacyLevel('nobody'));
      expect(state.privacyLevel).toBe('nobody');
    });

    it('should set to friends', () => {
      const state = privacyReducer({ ...initialState, privacyLevel: 'everyone' }, setPrivacyLevel('friends'));
      expect(state.privacyLevel).toBe('friends');
    });
  });

  describe('setGhostMode', () => {
    it('should enable ghost mode', () => {
      const ghostConfig = { enabled: true, duration: '1h' as const, until: '2024-06-01T13:00:00Z' };
      const state = privacyReducer(initialState, setGhostMode(ghostConfig));
      expect(state.ghostMode).toEqual(ghostConfig);
    });

    it('should disable ghost mode', () => {
      const enabledState = {
        ...initialState,
        ghostMode: { enabled: true, duration: '1h' as const },
      };
      const state = privacyReducer(enabledState, setGhostMode({ enabled: false }));
      expect(state.ghostMode.enabled).toBe(false);
    });

    it('should set indefinite ghost mode', () => {
      const state = privacyReducer(initialState, setGhostMode({ enabled: true, duration: 'indefinite' }));
      expect(state.ghostMode.enabled).toBe(true);
      expect(state.ghostMode.duration).toBe('indefinite');
    });
  });

  describe('addAllowedContact', () => {
    it('should add an allowed contact', () => {
      const state = privacyReducer(initialState, addAllowedContact('user-1'));
      expect(state.allowedContacts).toEqual(['user-1']);
    });

    it('should not add duplicate contact', () => {
      const stateWithContact = { ...initialState, allowedContacts: ['user-1'] };
      const state = privacyReducer(stateWithContact, addAllowedContact('user-1'));
      expect(state.allowedContacts).toEqual(['user-1']);
    });

    it('should add multiple different contacts', () => {
      let state = privacyReducer(initialState, addAllowedContact('user-1'));
      state = privacyReducer(state, addAllowedContact('user-2'));
      expect(state.allowedContacts).toEqual(['user-1', 'user-2']);
    });
  });

  describe('removeAllowedContact', () => {
    it('should remove an allowed contact', () => {
      const stateWithContact = { ...initialState, allowedContacts: ['user-1', 'user-2'] };
      const state = privacyReducer(stateWithContact, removeAllowedContact('user-1'));
      expect(state.allowedContacts).toEqual(['user-2']);
    });

    it('should handle removing non-existent contact', () => {
      const state = privacyReducer(initialState, removeAllowedContact('non-existent'));
      expect(state.allowedContacts).toEqual([]);
    });
  });

  describe('addBlockedContact', () => {
    it('should add a blocked contact', () => {
      const state = privacyReducer(initialState, addBlockedContact('user-1'));
      expect(state.blockedContacts).toEqual(['user-1']);
    });

    it('should not add duplicate blocked contact', () => {
      const stateWithBlocked = { ...initialState, blockedContacts: ['user-1'] };
      const state = privacyReducer(stateWithBlocked, addBlockedContact('user-1'));
      expect(state.blockedContacts).toEqual(['user-1']);
    });

    it('should add multiple different blocked contacts', () => {
      let state = privacyReducer(initialState, addBlockedContact('user-1'));
      state = privacyReducer(state, addBlockedContact('user-2'));
      expect(state.blockedContacts).toEqual(['user-1', 'user-2']);
    });
  });

  describe('removeBlockedContact', () => {
    it('should remove a blocked contact', () => {
      const stateWithBlocked = { ...initialState, blockedContacts: ['user-1', 'user-2'] };
      const state = privacyReducer(stateWithBlocked, removeBlockedContact('user-1'));
      expect(state.blockedContacts).toEqual(['user-2']);
    });

    it('should handle removing non-existent blocked contact', () => {
      const state = privacyReducer(initialState, removeBlockedContact('non-existent'));
      expect(state.blockedContacts).toEqual([]);
    });
  });

  describe('setShowPreciseLocation', () => {
    it('should enable precise location', () => {
      const state = privacyReducer({ ...initialState, showPreciseLocation: false }, setShowPreciseLocation(true));
      expect(state.showPreciseLocation).toBe(true);
    });

    it('should disable precise location', () => {
      const state = privacyReducer(initialState, setShowPreciseLocation(false));
      expect(state.showPreciseLocation).toBe(false);
    });
  });

  describe('setShareLocationHistory', () => {
    it('should enable location history sharing', () => {
      const state = privacyReducer(initialState, setShareLocationHistory(true));
      expect(state.shareLocationHistory).toBe(true);
    });

    it('should disable location history sharing', () => {
      const state = privacyReducer({ ...initialState, shareLocationHistory: true }, setShareLocationHistory(false));
      expect(state.shareLocationHistory).toBe(false);
    });
  });

  describe('setAllowStrangerMessages', () => {
    it('should enable stranger messages', () => {
      const state = privacyReducer(initialState, setAllowStrangerMessages(true));
      expect(state.allowStrangerMessages).toBe(true);
    });

    it('should disable stranger messages', () => {
      const state = privacyReducer({ ...initialState, allowStrangerMessages: true }, setAllowStrangerMessages(false));
      expect(state.allowStrangerMessages).toBe(false);
    });
  });

  describe('setShowOnlineStatus', () => {
    it('should enable online status', () => {
      const state = privacyReducer({ ...initialState, showOnlineStatus: false }, setShowOnlineStatus(true));
      expect(state.showOnlineStatus).toBe(true);
    });

    it('should disable online status', () => {
      const state = privacyReducer(initialState, setShowOnlineStatus(false));
      expect(state.showOnlineStatus).toBe(false);
    });
  });

  describe('updateNotifications', () => {
    it('should update a single notification setting', () => {
      const state = privacyReducer(initialState, updateNotifications({ pushEnabled: false }));
      expect(state.notifications.pushEnabled).toBe(false);
      expect(state.notifications.locationUpdates).toBe(true);
      expect(state.notifications.friendRequests).toBe(true);
      expect(state.notifications.messages).toBe(true);
    });

    it('should update multiple notification settings', () => {
      const state = privacyReducer(
        initialState,
        updateNotifications({ pushEnabled: false, messages: false })
      );
      expect(state.notifications.pushEnabled).toBe(false);
      expect(state.notifications.messages).toBe(false);
      expect(state.notifications.locationUpdates).toBe(true);
    });

    it('should handle empty update', () => {
      const state = privacyReducer(initialState, updateNotifications({}));
      expect(state.notifications).toEqual(initialState.notifications);
    });

    it('should not affect other state properties', () => {
      const state = privacyReducer(initialState, updateNotifications({ pushEnabled: false }));
      expect(state.shareLocation).toBe(false);
      expect(state.privacyLevel).toBe('friends');
    });
  });
});
