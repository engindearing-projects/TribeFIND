const detox = require('detox');
const adapter = require('detox/runners/jest/adapter');
const config = require('../.detoxrc.js');

// Set the default timeout for Detox operations to 120 seconds
detox.setDefaultTimeout(120000);

beforeAll(async () => {
  await detox.init(config, { launchApp: false });
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});
