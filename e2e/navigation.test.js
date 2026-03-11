describe('Navigation Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // Note: These tests assume the user is already authenticated.
  // In a full CI setup, a test user would be pre-seeded or login performed first.

  it('should show auth screen when not logged in', async () => {
    await expect(element(by.id('auth-screen'))).toBeVisible();
  });

  describe('when authenticated', () => {
    beforeAll(async () => {
      // Attempt login with test credentials
      // If this fails, remaining tests in this describe block will be skipped
      try {
        await element(by.id('email-input')).typeText('e2e-test@tribefind.com');
        await element(by.id('password-input')).typeText('E2eTestPass123!');
        await element(by.id('auth-submit-button')).tap();

        // Wait for home screen to appear
        await waitFor(element(by.id('home-screen')))
          .toBeVisible()
          .withTimeout(10000);
      } catch (e) {
        console.log('Auth setup failed — navigation tests may not run:', e.message);
      }
    });

    it('should show the home screen after login', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
      await expect(element(by.id('welcome-text'))).toBeVisible();
    });

    it('should switch between photos and videos tabs on home', async () => {
      await expect(element(by.id('photos-tab'))).toBeVisible();
      await expect(element(by.id('videos-tab'))).toBeVisible();

      await element(by.id('videos-tab')).tap();
      await element(by.id('photos-tab')).tap();
    });

    it('should navigate to chat list tab', async () => {
      // Tap the Chat tab in the bottom tab bar
      await element(by.text('Chat')).tap();
      await expect(element(by.id('chat-list-screen'))).toBeVisible();
    });

    it('should navigate to map tab', async () => {
      await element(by.text('Map')).tap();
      await waitFor(element(by.id('map-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should navigate to profile tab', async () => {
      await element(by.text('Profile')).tap();
      await expect(element(by.id('profile-screen'))).toBeVisible();
      await expect(element(by.id('profile-display-name'))).toBeVisible();
    });

    it('should navigate back to home tab', async () => {
      await element(by.text('Home')).tap();
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should show sign out button on profile', async () => {
      await element(by.text('Profile')).tap();
      await expect(element(by.id('sign-out-button'))).toBeVisible();
    });
  });
});
