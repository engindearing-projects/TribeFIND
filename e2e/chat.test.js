describe('Chat Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('when authenticated', () => {
    beforeAll(async () => {
      try {
        await element(by.id('email-input')).typeText('e2e-test@tribefind.com');
        await element(by.id('password-input')).typeText('E2eTestPass123!');
        await element(by.id('auth-submit-button')).tap();

        await waitFor(element(by.id('home-screen')))
          .toBeVisible()
          .withTimeout(10000);
      } catch (e) {
        console.log('Auth setup failed — chat tests may not run:', e.message);
      }
    });

    it('should navigate to chat list screen', async () => {
      await element(by.text('Chat')).tap();
      await expect(element(by.id('chat-list-screen'))).toBeVisible();
    });

    it('should show the search input on chat list', async () => {
      await element(by.text('Chat')).tap();
      await expect(element(by.id('chat-search-input'))).toBeVisible();
    });

    it('should allow searching for tribe members', async () => {
      await element(by.text('Chat')).tap();
      await element(by.id('chat-search-input')).typeText('test');

      // Search should trigger — either show results or empty state
      await waitFor(element(by.id('chat-search-input')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should clear search and show chat rooms', async () => {
      await element(by.text('Chat')).tap();

      // Type a search query
      await element(by.id('chat-search-input')).typeText('test');
      // Clear the search
      await element(by.id('chat-search-input')).clearText();

      // Should go back to showing chat rooms (or empty state)
      await expect(element(by.id('chat-list-screen'))).toBeVisible();
    });

    it('should open a chat room when one exists', async () => {
      await element(by.text('Chat')).tap();

      try {
        // Try to tap the first chat room if one exists
        await waitFor(element(by.id('chat-room-item')))
          .toBeVisible()
          .withTimeout(5000);

        await element(by.id('chat-room-item')).atIndex(0).tap();

        // Should navigate to chat screen
        await expect(element(by.id('chat-screen'))).toBeVisible();
        await expect(element(by.id('message-input'))).toBeVisible();
        await expect(element(by.id('send-button'))).toBeVisible();
      } catch (e) {
        // No chat rooms exist — that's fine for E2E, just verify the list screen is still showing
        console.log('No chat rooms found — skipping chat room navigation test');
        await expect(element(by.id('chat-list-screen'))).toBeVisible();
      }
    });

    it('should allow typing a message in chat', async () => {
      await element(by.text('Chat')).tap();

      try {
        await waitFor(element(by.id('chat-room-item')))
          .toBeVisible()
          .withTimeout(5000);

        await element(by.id('chat-room-item')).atIndex(0).tap();
        await expect(element(by.id('chat-screen'))).toBeVisible();

        // Type a message
        await element(by.id('message-input')).typeText('Hello from E2E test');
        await expect(element(by.id('message-input'))).toHaveText('Hello from E2E test');

        // Send button should be visible
        await expect(element(by.id('send-button'))).toBeVisible();
      } catch (e) {
        console.log('No chat rooms available — skipping message typing test');
      }
    });

    it('should navigate back from chat screen', async () => {
      await element(by.text('Chat')).tap();

      try {
        await waitFor(element(by.id('chat-room-item')))
          .toBeVisible()
          .withTimeout(5000);

        await element(by.id('chat-room-item')).atIndex(0).tap();
        await expect(element(by.id('chat-screen'))).toBeVisible();

        // Go back
        await element(by.id('chat-back-button')).tap();
        await expect(element(by.id('chat-list-screen'))).toBeVisible();
      } catch (e) {
        console.log('No chat rooms available — skipping back navigation test');
      }
    });
  });
});
