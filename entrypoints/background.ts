import { browser } from 'wxt/browser';

export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'toggle_palette') return;

    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) return;

    if (
      !tab.url ||
      tab.url.startsWith('chrome://') ||
      tab.url.startsWith('edge://') ||
      tab.url.startsWith('about:') ||
      tab.url.startsWith('chrome-extension://') ||
      tab.url.startsWith('moz-extension://')
    ) {
      return;
    }

    try {
      await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_PALETTE',
      });
    } catch {
      // Content script may not be available on internal or already-open pages.
    }
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'ZEN_PALETTE_OPEN') return;

    const url = message.url;

    if (typeof url !== 'string' || !url.trim()) return;

    browser.tabs.create({
      url,
    });
  });
});