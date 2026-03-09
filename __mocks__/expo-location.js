export const Accuracy = {
  Balanced: 3,
  BestForNavigation: 6,
  Low: 1,
};

export const getForegroundPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted', granted: true })
);

export const requestForegroundPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted', granted: true })
);

export const getCurrentPositionAsync = jest.fn(() =>
  Promise.resolve({
    coords: {
      latitude: 34.052235,
      longitude: -118.243683,
      accuracy: 5,
      altitude: 100,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  })
);

export const watchPositionAsync = jest.fn((options, callback) => {
  // Simulate a single location update immediately
  // In a real test, you might want to call the callback manually
  // or simulate multiple updates over time.
  const mockLocation = {
    coords: {
      latitude: 34.052235,
      longitude: -118.243683,
      accuracy: 5,
      altitude: 100,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  };
  callback(mockLocation);

  // Return a mock subscription object with a remove method
  return Promise.resolve({
    remove: jest.fn(),
  });
});

export const stopLocationUpdatesAsync = jest.fn(() => Promise.resolve());

export const hasStartedLocationUpdatesAsync = jest.fn(() => Promise.resolve(false));

export const startLocationUpdatesAsync = jest.fn(() => Promise.resolve());
