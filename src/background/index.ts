import browser from 'webextension-polyfill';
import { getManagedTidGiRuleIds, getTidGiAuthRules } from './tidgiAuthRules';
import { useServerStore } from '../shared/server/store';

async function syncTidGiAuthRules() {
  if (!chrome.declarativeNetRequest?.updateDynamicRules) {
    return;
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: getManagedTidGiRuleIds(),
    addRules: getTidGiAuthRules(useServerStore.getState().servers),
  });
}

useServerStore.subscribe((state) => {
  // access store state
  // eslint-disable-next-line security-node/detect-crlf
  console.log('state changed', state);
  void syncTidGiAuthRules();
});

void syncTidGiAuthRules();

// show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // show the welcome page
    const url = browser.runtime.getURL('welcome/welcome.html');
    await browser.tabs.create({ url });
  }

  await syncTidGiAuthRules();
});
