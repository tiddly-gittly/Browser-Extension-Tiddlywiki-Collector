/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useState } from 'react';
import type { ITiddlerFields } from 'tw5-typed';
import { useServerStore } from '../server';

export function useAvailableTags() {
  const activeServers = useServerStore(({ servers }) => Object.values(servers).filter(server => server.active));
  /** fetched all tags from active servers */
  const [availableTagOptions, setAvailableTagOptions] = useState<Array<{ label: string; value: string }>>([]);
  useEffect(() => {
    if (availableTagOptions.length > 0) return;
    const getTagsTask = activeServers.map(item => item.uri).map(async serverUriBase => {
      try {
        const url = new URL('/recipes/default/tiddlers.json?filter=[tags[]]', serverUriBase);
        // FIXME: will auto become https and cause CORS error
        const tagsJSON = await fetch(url).then(async response => await (await response.json() as Promise<ITiddlerFields[]>));
        return tagsJSON;
      } catch (error) {
        console.error(error);
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
  }, [activeServers, availableTagOptions.length]);
  return availableTagOptions;
}
