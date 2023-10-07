/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Readability } from '@mozilla/readability';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import type { ITiddlerFields } from 'tw5-typed';
import { useAddTiddlerToServer } from '../shared/hooks/useAddTiddlerToServer';
import { useServerStore } from '../shared/server';

export function Popup() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const activeServers = useServerStore(({ servers }) => Object.values(servers).filter(server => server.active));
  // Get the current webpage URL
  const url = window.location.href;

  // Assume a list of available tags for autocomplete
  const tagOptions = [
    { value: 'tag1', label: 'Tag 1' },
    { value: 'tag2', label: 'Tag 2' },
    // ... more tags
  ];

  useEffect(() => {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();
    if (article !== null) {
      setTitle(article.title);
      setContent(article.content);
    }
  }, []);

  const addTiddlerToServer = useAddTiddlerToServer();

  const addTiddlerToAllActiveServers = useCallback(async (newTiddler: Omit<ITiddlerFields, 'created' | 'modified'>) => {
    for (const server of activeServers) {
      try {
        await addTiddlerToServer(server, newTiddler);
      } catch (error) {
        console.error(error);
      }
    }
  }, [activeServers, addTiddlerToServer]);
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
    yourDOMPickerFunction((selectedContent) => {
      window.close(); // Close the popup
    });
    const newTiddler = { title, text: selectedContent, url, tags, type: 'text/vnd.tiddlywiki' };
    await addTiddlerToAllActiveServers(newTiddler);
  }, [title, url, tags, addTiddlerToAllActiveServers]);

  const handleBookmark = useCallback(async () => {
    const newTiddler = { title, url, tags, type: 'text/vnd.tiddlywiki' };
    await addTiddlerToAllActiveServers(newTiddler);
  }, [title, url, tags, addTiddlerToAllActiveServers]);

  return (
    <div className='fixed z-[999] bottom-2 right-2 shadow-xl border-[1px] bg-white bg-opacity-10'>
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
          options={tagOptions}
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
