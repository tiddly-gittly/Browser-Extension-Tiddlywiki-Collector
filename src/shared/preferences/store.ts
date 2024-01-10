/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { wrapStore } from 'webext-zustand';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { IContent } from '../../popup/hooks/useTransformFormat';

export interface PreferenceState {
  defaultTagsForAssets: string[];
  defaultTagsForContent: string[];
  preferredContentType: keyof IContent;
}
const defaultPreferences: PreferenceState = {
  defaultTagsForContent: [],
  defaultTagsForAssets: [],
  preferredContentType: 'html',
};
export const possibleContentTypes: Array<keyof IContent> = ['html', 'text', 'markdown', 'wikitext'];
interface PreferenceActions {
  setDefaultTagsForAssets: (tags: string[]) => void;
  setDefaultTagsForContent: (tags: string[]) => void;
  setPreferredContentType: (contentType: keyof IContent) => void;
}

export const usePreferenceStore = create<PreferenceState & PreferenceActions>()(
  immer(devtools(
    persist(
      (set) => ({
        ...defaultPreferences,
        setDefaultTagsForContent: (tags) => {
          set((state) => {
            state.defaultTagsForContent = tags;
          });
        },
        setDefaultTagsForAssets: (tags) => {
          set((state) => {
            state.defaultTagsForAssets = tags;
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
      },
    ),
  )),
);

export const preferenceStoreReadyPromise = wrapStore(usePreferenceStore);
