/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { localStorage } from 'redux-persist-webextension-storage';
import { wrapStore } from 'webext-zustand';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { IContent } from '../../popup/hooks/useTransformFormat';

export interface PreferenceState {
  defaultTags: string[];
  preferredContentType: keyof IContent;
}
const defaultPreferences: PreferenceState = {
  defaultTags: [],
  preferredContentType: 'html',
};
export const possibleContentTypes: Array<keyof IContent> = ['html', 'text', 'markdown', 'wikitext'];
interface PreferenceActions {
  setDefaultTags: (tags: string[]) => void;
  setPreferredContentType: (contentType: keyof IContent) => void;
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
        setPreferredContentType: (contentType) => {
          set((state) => {
            state.preferredContentType = contentType;
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
