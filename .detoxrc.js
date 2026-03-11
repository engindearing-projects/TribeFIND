/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: { 
    $0: 'jest',
    args: {
      config: 'e2e/jest.config.js',
      _: ['e2e']
    }
  },
  logger: {
    level: 'warn'
  },
  artifacts: {
    rootDir: '.detox_artifacts',
    plugins: {
      log: 'failing',
      screenshot: 'failing'
    }
  },
  apps: {
    'ios.sim.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/tribefind.app',
      build: 'xcodebuild -workspace ios/TribeFind.xcodeproj -scheme TribeFind -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      // build: 'expo prebuild --platform ios && cd ios && pod install && xcodebuild -workspace TribeFind.xcworkspace -scheme TribeFind -configuration Debug -sdk iphonesimulator -derivedDataPath build',
    },
    'ios.sim.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/tribefind.app',
      build: 'xcodebuild -workspace ios/TribeFind.xcodeproj -scheme TribeFind -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        os: 'iOS 17.5',
        type: 'iPhone 15 Pro'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.sim.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.sim.release'
    }
  }
};
