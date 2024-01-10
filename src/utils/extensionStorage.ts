/* eslint-disable security-node/detect-crlf */
import { StateStorage } from 'zustand/middleware';

export const getExtensionStorage = (storageName: string): StateStorage => ({
  getItem: async (key: string): Promise<string | null> => {
    console.log(key, `has been retrieved in ${storageName}`);
    const result = await chrome.storage.sync.get(`${storageName}-${key}`);
    return result[`${storageName}-${key}`] as string | null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    console.log(key, 'with value', value, `has been saved in ${storageName}`);
    await chrome.storage.sync.set({ [`${storageName}-${key}`]: value });
  },
  removeItem: async (key: string): Promise<void> => {
    console.log(key, `has been deleted from ${storageName}`);
    await chrome.storage.sync.remove(`${storageName}-${key}`);
  },
});
