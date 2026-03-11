describe('App Launch', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show auth screen on fresh launch', async () => {
    await expect(element(by.id('auth-screen'))).toBeVisible();
  });

  it('should show the app title', async () => {
    await expect(element(by.text('TribeFind'))).toBeVisible();
  });
});
