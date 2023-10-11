/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { localStorage } from 'redux-persist-webextension-storage';
import { wrapStore } from 'webext-zustand';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface PreferenceState {
  defaultTags: string[];
}
const defaultPreferences: PreferenceState = {
  defaultTags: [],
};
interface PreferenceActions {
  setDefaultTags: (tags: string[]) => void;
}

export const usePreferenceStore = create<PreferenceState & PreferenceActions>()(
  immer(devtools(
    persist(
      (set) => ({
        ...defaultPreferences,
        setDefaultTags: (tags) => {
          set((state) => {
            state.defaultTags = tags;
          });
        },
      }),
      {
        name: 'preference-storage',
        storage: createJSONStorage(() => localStorage),
      },
    ),
  )),
);

export const preferenceStoreReadyPromise = wrapStore(usePreferenceStore);
