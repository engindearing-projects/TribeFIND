describe('Auth Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the auth screen on launch', async () => {
    await expect(element(by.id('auth-screen'))).toBeVisible();
  });

  it('should show email and password inputs', async () => {
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
  });

  it('should show social sign-in buttons', async () => {
    await expect(element(by.id('google-signin-button'))).toBeVisible();
    await expect(element(by.id('twitter-signin-button'))).toBeVisible();
    await expect(element(by.id('apple-signin-button'))).toBeVisible();
  });

  it('should switch to sign-up mode and show extra fields', async () => {
    await element(by.id('switch-auth-mode')).tap();

    await expect(element(by.id('username-input'))).toBeVisible();
    await expect(element(by.id('display-name-input'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
  });

  it('should switch back to sign-in mode', async () => {
    // First switch to sign-up
    await element(by.id('switch-auth-mode')).tap();
    await expect(element(by.id('username-input'))).toBeVisible();

    // Switch back to sign-in
    await element(by.id('switch-auth-mode')).tap();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    // Username field should not be visible in sign-in mode
    await expect(element(by.id('username-input'))).not.toBeVisible();
  });

  it('should allow typing email and password', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('TestPassword123');

    await expect(element(by.id('email-input'))).toHaveText('test@example.com');
    await expect(element(by.id('password-input'))).toHaveText('TestPassword123');
  });

  it('should allow typing sign-up fields', async () => {
    await element(by.id('switch-auth-mode')).tap();

    await element(by.id('username-input')).typeText('testuser');
    await element(by.id('display-name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('TestPassword123');

    await expect(element(by.id('username-input'))).toHaveText('testuser');
    await expect(element(by.id('display-name-input'))).toHaveText('Test User');
  });

  it('should have a tappable submit button', async () => {
    await expect(element(by.id('auth-submit-button'))).toBeVisible();
    // Tap the button — in a real E2E environment this would trigger auth
    await element(by.id('auth-submit-button')).tap();
  });
});
