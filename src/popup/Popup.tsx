/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Readability } from '@mozilla/readability';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useAddTiddlerToServer } from '../shared/hooks/useAddTiddlerToServer';
import { useAvailableTags } from '../shared/hooks/useAvailableTags';
import { ITabActions, ITabMessage } from '../shared/message';

export function Popup() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  /** selected tags */
  const [tags, setTags] = useState<string[]>([]);

  const [servers, setServers] = useState<string[]>([]);
  // Get the current webpage URL
  const url = window.location.href;

  useEffect(() => {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();
    if (article !== null) {
      setTitle(article.title);
      setContent(article.content);
    }
  }, []);

  const { activeServers, addTiddlerToAllActiveServers } = useAddTiddlerToServer();
  useEffect(() => {
    setServers(activeServers.map(item => item.id));
  }, [activeServers]);

  const selectedServerDataForSelectUI = useMemo(
    () => servers.filter(id => activeServers.find(item => item.id === id)).map(id => ({ value: id, label: activeServers.find(item => item.id === id)?.name ?? '-' })),
    [activeServers, servers],
  );
  /**
   * A list of available servers for autocomplete
   */
  const availableServerOptions = useMemo(
    () => activeServers.map(item => ({ value: item.id, label: item.name || item.uri })),
    [activeServers],
  );
  const availableTagOptions = useAvailableTags();

  const handleAutoSelect = useCallback(async () => {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();
    if (article !== null) {
      const newTiddler = { title: title || article.title, url, text: article.content, tags, type: 'text/vnd.tiddlywiki' };
      await addTiddlerToAllActiveServers(newTiddler);
    }
    window.close(); // Close the popup
  }, [title, url, tags, addTiddlerToAllActiveServers]);

  const handleManualSelect = useCallback(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeID = tabs[0].id;
      if (activeID === undefined) return;
      const newTiddler = { title, url, tags, type: 'text/vnd.tiddlywiki' };
      await chrome.tabs.sendMessage<ITabMessage, undefined>(activeID, { action: ITabActions.startClipping, newTiddler });
      window.close(); // Close the popup
    });
  }, [tags, title, url]);

  const handleBookmark = useCallback(async () => {
    const newTiddler = { title, url, tags, type: 'text/vnd.tiddlywiki' };
    await addTiddlerToAllActiveServers(newTiddler);
  }, [title, url, tags, addTiddlerToAllActiveServers]);

  return (
    <div className='w-72 shadow-xl border-[1px] bg-white bg-opacity-10'>
      <div className='flex flex-col p-4'>
        <input
          type='text'
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          placeholder='Title'
          className='mb-2 p-2 border rounded'
        />
        <Select
          isMulti
          value={tags.map(item => ({ value: item, label: item }))}
          onChange={(selectedOptions) => {
            setTags(selectedOptions.map(item => item.value));
          }}
          options={availableTagOptions}
          className='mb-2'
          placeholder='Select tags...'
        />
        <Select
          isMulti
          value={selectedServerDataForSelectUI}
          onChange={(selectedOptions) => {
            setServers(selectedOptions.map(item => item.value));
          }}
          options={availableServerOptions}
          className='mb-2'
          placeholder='Select tags...'
        />
        <div className='flex space-x-2'>
          <button onClick={handleAutoSelect} className='p-2 border rounded bg-blue-500 text-white'>{t('Auto Select')}</button>
          <button onClick={handleManualSelect} className='p-2 border rounded bg-blue-500 text-white'>{t('Manual Select')}</button>
          <button onClick={handleBookmark} className='p-2 border rounded bg-blue-500 text-white'>{t('Bookmark')}</button>
        </div>
      </div>
    </div>
  );
}
