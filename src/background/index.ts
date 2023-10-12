import browser from 'webextension-polyfill';
import { useServerStore } from '../shared/server/store';

useServerStore.subscribe((state) => {
  // access store state
  // eslint-disable-next-line security-node/detect-crlf
  console.log('state changed', state);
});

// show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // show the welcome page
    const url = browser.runtime.getURL('welcome/welcome.html');
    await browser.tabs.create({ url });
  }
});
