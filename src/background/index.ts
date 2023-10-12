import browser from 'webextension-polyfill';
// import { useServerStore } from '../shared/server/store';

// useServerStore.subscribe((state) => {
//   // access store state
//   // console.log(state);
// });

// show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // show the welcome page
    const url = browser.runtime.getURL('welcome/welcome.html');
    await browser.tabs.create({ url });
  }
});
