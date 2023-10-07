import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ITiddlerFields } from 'tw5-typed';
import { IServerInfo } from '../server/store';

export function useAddTiddlerToServer() {
  const { t } = useTranslation();
  return useCallback(async (server: IServerInfo, tiddler: Omit<ITiddlerFields, 'created' | 'modified'>): Promise<void> => {
    const syncUrl = new URL(`recipes/default/tiddlers/${tiddler.title}`, server.uri);
    try {
      await fetch(syncUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'TiddlyWiki',
        },
        body: JSON.stringify({ title: tiddler.title, fields: tiddler }),
      });
    } catch (error) {
      console.error(`${server.name} ${t('Log.SaveFailed')} Error: ${(error as Error).message}`);
    }
  }, [t]);
}
