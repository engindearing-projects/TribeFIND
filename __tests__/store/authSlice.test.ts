import authReducer, { setAuth, setLoading, clearAuth, updateUser } from '../../store/authSlice';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  display_name: 'Test User',
  username: 'testuser',
  avatar: 'https://example.com/avatar.png',
  bio: 'Test bio',
  snap_score: 100,
  joined_at: '2024-01-01T00:00:00Z',
  last_active: '2024-06-01T00:00:00Z',
  is_online: true,
  settings: {
    share_location: true,
    allow_friend_requests: true,
    show_online_status: true,
    allow_message_from_strangers: false,
    ghost_mode: false,
    privacy_level: 'friends',
    notifications: {
      push_enabled: true,
      location_updates: true,
      friend_requests: true,
      messages: true,
    },
  },
  stats: {
    snaps_shared: 50,
    friends_count: 25,
    stories_posted: 10,
  },
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'user-123', email: 'test@example.com' },
};

describe('authSlice', () => {
  const initialState = {
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start with loading true', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.loading).toBe(true);
    });

    it('should start with isAuthenticated false', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('should set user and session when both provided', () => {
      const state = authReducer(
        initialState,
        setAuth({ user: mockUser as any, session: mockSession })
      );
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should set isAuthenticated to false when user is null', () => {
      const state = authReducer(
        initialState,
        setAuth({ user: null, session: mockSession })
      );
      expect(state.user).toBeNull();
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should set isAuthenticated to false when session is null', () => {
      const state = authReducer(
        initialState,
        setAuth({ user: mockUser as any, session: null })
      );
      expect(state.user).toEqual(mockUser);
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should always set loading to false', () => {
      const loadingState = { ...initialState, loading: true };
      const state = authReducer(
        loadingState,
        setAuth({ user: null, session: null })
      );
      expect(state.loading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const state = authReducer(
        { ...initialState, loading: false },
        setLoading(true)
      );
      expect(state.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const state = authReducer(
        { ...initialState, loading: true },
        setLoading(false)
      );
      expect(state.loading).toBe(false);
    });

    it('should not affect other state properties', () => {
      const authenticatedState = {
        user: mockUser as any,
        session: mockSession,
        loading: false,
        isAuthenticated: true,
      };
      const state = authReducer(authenticatedState, setLoading(true));
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('clearAuth', () => {
    it('should reset all auth state', () => {
      const authenticatedState = {
        user: mockUser as any,
        session: mockSession,
        loading: false,
        isAuthenticated: true,
      };
      const state = authReducer(authenticatedState, clearAuth());
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should be idempotent on already cleared state', () => {
      const clearedState = {
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
      };
      const state = authReducer(clearedState, clearAuth());
      expect(state).toEqual(clearedState);
    });
  });

  describe('updateUser', () => {
    it('should update user fields when user exists', () => {
      const authenticatedState = {
        user: mockUser as any,
        session: mockSession,
        loading: false,
        isAuthenticated: true,
      };
      const state = authReducer(
        authenticatedState,
        updateUser({ display_name: 'Updated Name', bio: 'Updated bio' })
      );
      expect(state.user?.display_name).toBe('Updated Name');
      expect(state.user?.bio).toBe('Updated bio');
      expect(state.user?.email).toBe('test@example.com');
      expect(state.user?.username).toBe('testuser');
    });

    it('should not modify state when user is null', () => {
      const state = authReducer(
        initialState,
        updateUser({ display_name: 'Updated Name' })
      );
      expect(state.user).toBeNull();
    });

    it('should not affect session or authentication status', () => {
      const authenticatedState = {
        user: mockUser as any,
        session: mockSession,
        loading: false,
        isAuthenticated: true,
      };
      const state = authReducer(
        authenticatedState,
        updateUser({ display_name: 'New Name' })
      );
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });
  });
});
