import locationReducer, {
  setCurrentLocation,
  setTracking,
  setPermission,
  setTrackingAccuracy,
  setUpdateInterval,
  setBackgroundTracking,
  clearLocationHistory,
} from '../../store/locationSlice';

const mockLocation = {
  latitude: 40.7128,
  longitude: -74.006,
  timestamp: '2024-06-01T12:00:00Z',
  accuracy: 10,
  heading: 90,
  speed: 5,
};

describe('locationSlice', () => {
  const initialState = {
    currentLocation: null,
    isTracking: false,
    hasPermission: false,
    trackingAccuracy: 'medium' as const,
    updateInterval: 30000,
    locationHistory: [],
    backgroundTracking: false,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = locationReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should start with no current location', () => {
      const state = locationReducer(undefined, { type: 'unknown' });
      expect(state.currentLocation).toBeNull();
    });

    it('should start with tracking disabled', () => {
      const state = locationReducer(undefined, { type: 'unknown' });
      expect(state.isTracking).toBe(false);
    });
  });

  describe('setCurrentLocation', () => {
    it('should set the current location', () => {
      const state = locationReducer(initialState, setCurrentLocation(mockLocation));
      expect(state.currentLocation).toEqual(mockLocation);
    });

    it('should add location to history', () => {
      const state = locationReducer(initialState, setCurrentLocation(mockLocation));
      expect(state.locationHistory).toHaveLength(1);
      expect(state.locationHistory[0]).toEqual(mockLocation);
    });

    it('should prepend new locations to history', () => {
      const secondLocation = { ...mockLocation, latitude: 41.0, timestamp: '2024-06-01T12:01:00Z' };
      let state = locationReducer(initialState, setCurrentLocation(mockLocation));
      state = locationReducer(state, setCurrentLocation(secondLocation));
      expect(state.locationHistory).toHaveLength(2);
      expect(state.locationHistory[0]).toEqual(secondLocation);
      expect(state.locationHistory[1]).toEqual(mockLocation);
    });

    it('should cap history at 100 entries', () => {
      let state = initialState;
      for (let i = 0; i < 105; i++) {
        state = locationReducer(
          state,
          setCurrentLocation({
            latitude: i,
            longitude: i,
            timestamp: `2024-06-01T${String(i).padStart(2, '0')}:00:00Z`,
          })
        );
      }
      expect(state.locationHistory).toHaveLength(100);
      // Most recent should be first
      expect(state.locationHistory[0].latitude).toBe(104);
    });

    it('should handle null location without adding to history', () => {
      let state = locationReducer(initialState, setCurrentLocation(mockLocation));
      expect(state.locationHistory).toHaveLength(1);
      state = locationReducer(state, setCurrentLocation(null));
      expect(state.currentLocation).toBeNull();
      expect(state.locationHistory).toHaveLength(1);
    });
  });

  describe('setTracking', () => {
    it('should set tracking to true', () => {
      const state = locationReducer(initialState, setTracking(true));
      expect(state.isTracking).toBe(true);
    });

    it('should set tracking to false', () => {
      const state = locationReducer({ ...initialState, isTracking: true }, setTracking(false));
      expect(state.isTracking).toBe(false);
    });

    it('should not affect other state properties', () => {
      const stateWithLocation = { ...initialState, currentLocation: mockLocation };
      const state = locationReducer(stateWithLocation, setTracking(true));
      expect(state.currentLocation).toEqual(mockLocation);
    });
  });

  describe('setPermission', () => {
    it('should set permission to true', () => {
      const state = locationReducer(initialState, setPermission(true));
      expect(state.hasPermission).toBe(true);
    });

    it('should set permission to false', () => {
      const state = locationReducer({ ...initialState, hasPermission: true }, setPermission(false));
      expect(state.hasPermission).toBe(false);
    });
  });

  describe('setTrackingAccuracy', () => {
    it('should set accuracy to high', () => {
      const state = locationReducer(initialState, setTrackingAccuracy('high'));
      expect(state.trackingAccuracy).toBe('high');
    });

    it('should set accuracy to low', () => {
      const state = locationReducer(initialState, setTrackingAccuracy('low'));
      expect(state.trackingAccuracy).toBe('low');
    });

    it('should set accuracy to medium', () => {
      const state = locationReducer({ ...initialState, trackingAccuracy: 'high' }, setTrackingAccuracy('medium'));
      expect(state.trackingAccuracy).toBe('medium');
    });
  });

  describe('setUpdateInterval', () => {
    it('should set the update interval', () => {
      const state = locationReducer(initialState, setUpdateInterval(60000));
      expect(state.updateInterval).toBe(60000);
    });

    it('should allow short intervals', () => {
      const state = locationReducer(initialState, setUpdateInterval(5000));
      expect(state.updateInterval).toBe(5000);
    });
  });

  describe('setBackgroundTracking', () => {
    it('should enable background tracking', () => {
      const state = locationReducer(initialState, setBackgroundTracking(true));
      expect(state.backgroundTracking).toBe(true);
    });

    it('should disable background tracking', () => {
      const state = locationReducer({ ...initialState, backgroundTracking: true }, setBackgroundTracking(false));
      expect(state.backgroundTracking).toBe(false);
    });
  });

  describe('clearLocationHistory', () => {
    it('should clear all location history', () => {
      let state = locationReducer(initialState, setCurrentLocation(mockLocation));
      expect(state.locationHistory).toHaveLength(1);
      state = locationReducer(state, clearLocationHistory());
      expect(state.locationHistory).toEqual([]);
    });

    it('should not affect current location', () => {
      let state = locationReducer(initialState, setCurrentLocation(mockLocation));
      state = locationReducer(state, clearLocationHistory());
      expect(state.currentLocation).toEqual(mockLocation);
    });

    it('should be idempotent on empty history', () => {
      const state = locationReducer(initialState, clearLocationHistory());
      expect(state.locationHistory).toEqual([]);
    });
  });
});
