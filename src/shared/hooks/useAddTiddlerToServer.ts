import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ITiddlerFieldsParam } from 'tw5-typed';
import { Writable } from 'type-fest';
import { addProtocolToUrl } from '../../utils';
import { IServerInfo, ServerStatus, useServerStore } from '../server/store';

export type ITiddlerToAdd = Writable<Omit<ITiddlerFieldsParam, 'created' | 'modified'>>;

export function useAddTiddlerToServer() {
  const { t } = useTranslation();
  const activeServers = useServerStore(({ servers }) => Object.values(servers).filter(server => server.active));
  const onlineServers = useServerStore(({ servers }) => Object.values(servers).filter(server => server.status === ServerStatus.online));
  const setActiveServers = useServerStore(({ setActive, servers }) => (idToActive: string[]) => {
    Object.values(servers).forEach(server => {
      if (idToActive.includes(server.id)) {
        setActive(server.id, true);
      } else {
        setActive(server.id, false);
      }
    });
  });
  const addTiddlerToServer = useCallback(async (server: IServerInfo, tiddler: ITiddlerToAdd): Promise<void> => {
    const syncUrl = new URL(`recipes/default/tiddlers/${tiddler.title as string}`, addProtocolToUrl(server.uri));
    try {
      tiddler.created = toTWUTCString(new Date());
      tiddler.creator = t('TWCollector');
      // Recent tab need `modified` field to work
      tiddler.modified = toTWUTCString(new Date());
      // user name on the view template is `modifier`
      tiddler.modifier = t('TWCollector');
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
    onlineServers,
    activeServers,
    setActiveServers,
    addTiddlerToServer,
    addTiddlerToAllActiveServers,
  };
}

export function pad(number: number) {
  if (number < 10) {
    return `0${number}`;
  }
  return String(number);
}
export function toTWUTCString(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${
    pad(
      date.getUTCHours(),
    )
  }${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}${
    (date.getUTCMilliseconds() / 1000)
      .toFixed(3)
      .slice(2, 5)
  }`;
}
