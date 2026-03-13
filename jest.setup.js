// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const MockMapView = (props) => React.createElement('MapView', props, props.children);
  MockMapView.Marker = (props) => React.createElement('Marker', props, props.children);
  MockMapView.Callout = (props) => React.createElement('Callout', props, props.children);
  MockMapView.Circle = (props) => React.createElement('Circle', props);
  MockMapView.Polyline = (props) => React.createElement('Polyline', props);
  MockMapView.Polygon = (props) => React.createElement('Polygon', props);
  MockMapView.Overlay = (props) => React.createElement('Overlay', props);
  MockMapView.Heatmap = (props) => React.createElement('Heatmap', props);
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMapView.Marker,
    Callout: MockMapView.Callout,
    Circle: MockMapView.Circle,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: null,
  };
});

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestMicrophonePermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getMicrophonePermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Constants: {
      Type: { back: 'back', front: 'front' },
      FlashMode: { on: 'on', off: 'off', auto: 'auto', torch: 'torch' },
    },
  },
  CameraView: (props) => require('react').createElement('CameraView', props, props.children),
  CameraType: { back: 'back', front: 'front' },
  useCameraPermissions: jest.fn().mockReturnValue([{ granted: true }, jest.fn()]),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 37.7749, longitude: -122.4194, altitude: 0, accuracy: 5, heading: 0, speed: 0 },
    timestamp: Date.now(),
  }),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  LocationAccuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
}));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: (props) => require('react').createElement('VisionCamera', props),
  useCameraDevice: jest.fn().mockReturnValue({ id: 'back', position: 'back' }),
  useCameraDevices: jest.fn().mockReturnValue({ back: { id: 'back' }, front: { id: 'front' } }),
  useCameraPermission: jest.fn().mockReturnValue({ hasPermission: true, requestPermission: jest.fn() }),
  useFrameProcessor: jest.fn(),
  useCameraFormat: jest.fn(),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(null),
    clear: jest.fn().mockResolvedValue(null),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(null),
    multiRemove: jest.fn().mockResolvedValue(null),
  },
}));

// Mock Supabase client
jest.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signInWithIdToken: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      linkIdentity: jest.fn().mockResolvedValue({ data: { url: 'https://mock-link-url' }, error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    }),
  },
  testSupabaseConnection: jest.fn().mockResolvedValue(true),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[mock-token]' }),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  AndroidImportance: { HIGH: 4 },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  modelName: 'iPhone 15',
}));

// Mock NotificationService
jest.mock('./services/NotificationService', () => ({
  NotificationService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    requestPermissions: jest.fn().mockResolvedValue(true),
    registerForPushNotifications: jest.fn().mockResolvedValue('ExponentPushToken[mock-token]'),
    savePushTokenToProfile: jest.fn().mockResolvedValue({}),
    setupListeners: jest.fn(),
    cleanup: jest.fn(),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    GestureHandlerRootView: View,
    Directions: {},
    gestureHandlerRootHOC: (component) => component,
  };
});

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useIsFocused: jest.fn().mockReturnValue(true),
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: (props) => React.createElement('LinearGradient', props, props.children),
  };
});

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn((component) => component),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((callback) => callback({ setExtra: jest.fn() })),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Mock SentryService
jest.mock('./services/SentryService', () => ({
  SentryService: {
    initialize: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
    addBreadcrumb: jest.fn(),
    isInitialized: jest.fn().mockReturnValue(false),
    wrap: jest.fn((component) => component),
  },
}));

// Mock AnalyticsService
jest.mock('./services/AnalyticsService', () => ({
  AnalyticsService: {
    trackEvent: jest.fn(),
    trackScreenView: jest.fn(),
    trackSignUp: jest.fn(),
    trackSignIn: jest.fn(),
    trackSignOut: jest.fn(),
    trackStoryCreated: jest.fn(),
    trackStoryViewed: jest.fn(),
    trackStoryDeleted: jest.fn(),
    trackChatMessageSent: jest.fn(),
    trackError: jest.fn(),
    setUser: jest.fn(),
  },
}));

// Mock services
jest.mock('./services/GoogleSignInService', () => ({
  GoogleSignInService: {
    isAvailable: jest.fn().mockReturnValue(false),
    configure: jest.fn().mockResolvedValue(false),
    signIn: jest.fn().mockResolvedValue({ error: 'Not available' }),
  },
}));

jest.mock('./services/TwitterSignInService', () => ({
  TwitterSignInService: {
    configure: jest.fn(),
    signIn: jest.fn().mockResolvedValue({ error: 'Not available' }),
  },
}));

jest.mock('./services/AppleSignInService', () => ({
  AppleSignInService: {
    isAvailable: jest.fn().mockResolvedValue(false),
    signIn: jest.fn().mockResolvedValue({ error: 'Not available' }),
  },
}));

// Silence console logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
