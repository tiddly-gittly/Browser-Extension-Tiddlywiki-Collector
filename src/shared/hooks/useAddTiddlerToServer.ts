import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ITiddlerFields } from 'tw5-typed';
import { IServerInfo, useServerStore } from '../server/store';

export type ITiddlerToAdd = Omit<ITiddlerFields, 'created' | 'modified'>;

export function useAddTiddlerToServer() {
  const { t } = useTranslation();
  const activeServers = useServerStore(({ servers }) => Object.values(servers).filter(server => server.active));
  const addTiddlerToServer = useCallback(async (server: IServerInfo, tiddler: ITiddlerToAdd): Promise<void> => {
    const syncUrl = new URL(`recipes/default/tiddlers/${tiddler.title as string}`, server.uri);
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
  const addTiddlerToAllActiveServers = useCallback(async (newTiddler: ITiddlerToAdd) => {
    for (const server of activeServers) {
      try {
        await addTiddlerToServer(server, newTiddler);
      } catch (error) {
        console.error(error);
      }
    }
  }, [activeServers, addTiddlerToServer]);
  return {
    activeServers,
    addTiddlerToServer,
    addTiddlerToAllActiveServers,
  };
}
