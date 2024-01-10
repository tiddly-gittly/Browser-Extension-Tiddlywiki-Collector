/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { ITiddlerFields } from 'tw5-typed';
import { addProtocolToUrl } from '../../utils';
import { useAddTiddlerToServer } from './useAddTiddlerToServer';

export function useAvailableTags() {
  const { activeServers, checkConnectionAndGetUsername } = useAddTiddlerToServer();

  /** fetched all tags from active servers */
  const [availableTagOptions, setAvailableTagOptions] = useState<Array<{ label: string; value: string }>>([]);
  useEffect(() => {
    // FIXME: activeServers change cause this hook render 6 times
    if (availableTagOptions.length > 0) return;
    const getTagsTask = activeServers.map(async server => {
      const url = new URL('/recipes/default/tiddlers.json?filter=[tags[]]', addProtocolToUrl(server.uri));
      try {
        await checkConnectionAndGetUsername(server);
      } catch (error) {
        const message = `${server.name} ${(error as Error).message}`;
        toast(message);
        console.error(message, error);
        return [];
      }
      try {
        // FIXME: will auto become https and cause CORS error
        const response = await fetch(url);
        if (response.status === 403) {
          toast(t('Error.WebServer403'));
          return [];
        }
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const tagsJSON = await (await response.json() as Promise<ITiddlerFields[]>);
        return tagsJSON;
      } catch (error) {
        console.error('useAvailableTags', error, (error as Error)?.message);
        if ((error as Error)?.message?.includes?.('CORS')) {
          toast(t('Error.WebServerCORS'));
        } else {
          toast(t('Error.WebServerUnknown'));
          try {
            console.error('useAvailableTags, errored content is', await fetch(url).then(async response => await response.text()));
          } catch {}
        }
        return [] as ITiddlerFields[];
      }
    });
    /**
     * A list of available tags for autocomplete
     */
    void Promise.all(getTagsTask).then(tags => {
      const tagsFromServer = tags.flat().map(item => {
        const label = `${(item.caption as string) ?? item.title} ${item.tags ? ` #${item.tags as unknown as string}` : ''}`;
        return ({ label, value: item.title });
      });
      if (tagsFromServer.length === 0) return;
      setAvailableTagOptions(tagsFromServer);
    });
  }, [activeServers, availableTagOptions.length, checkConnectionAndGetUsername]);
  return availableTagOptions;
}
