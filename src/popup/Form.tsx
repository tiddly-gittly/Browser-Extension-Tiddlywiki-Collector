/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Readability } from '@mozilla/readability';
import isEqual from 'lodash-es/isEqual';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useAddTiddlerToServer } from '../shared/hooks/useAddTiddlerToServer';
import { useAvailableTags } from '../shared/hooks/useAvailableTags';
import { usePreferenceStore } from '../shared/preferences/store';
import { useMessagingPopup } from './hooks/useMessaging';
import { useSetContentFromArticle } from './hooks/useSetContentFromArticle';
import { IContent } from './hooks/useTransformFormat';

export function Form(props: { setContent: Dispatch<SetStateAction<IContent>> }) {
  const { setContent } = props;
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { defaultTags } = usePreferenceStore();
  /** selected tags */
  const [tags, setTags] = useState<string[]>(defaultTags);
  const { article, setArticle } = useSetContentFromArticle(setContent, setTitle);
  const { handleManualSelect, handleGetReadability } = useMessagingPopup({ newTiddler: { title, url, tags }, setArticle, setUrl });
  // get readability on user first click on the popup
  useEffect(() => {
    void handleGetReadability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { activeServers, onlineServers, setActiveServers, addTiddlerToAllActiveServers } = useAddTiddlerToServer();

  const activeServerOptionsForSelectUI = useMemo(
    () =>
      activeServers.map(item => ({
        value: item.id,
        label: item.name || item.uri,
      })),
    [activeServers],
  );
  /**
   * A list of available servers for autocomplete
   */
  const availableServerOptions = useMemo(
    () => onlineServers.map(item => ({ value: item.id, label: item.name || item.uri })),
    [onlineServers],
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

  const handleBookmark = useCallback(async () => {
    const newTiddler = { title, url, tags, text: `[ext[${title.replaceAll('|', '-')}|${url}]]`, type: 'text/vnd.tiddlywiki' };
    await addTiddlerToAllActiveServers(newTiddler);
    window.close(); // Close the popup
  }, [title, url, tags, addTiddlerToAllActiveServers]);

  return (
    <div className='w-72 shadow-xl border-[1px] bg-white bg-opacity-10 h-fit'>
      <div className='flex flex-col p-4'>
        <input
          type='text'
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          placeholder={t('Title')}
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
          placeholder={t('SelectTags')}
        />
        <Select
          isMulti
          value={activeServerOptionsForSelectUI}
          onChange={(selectedOptions) => {
            const newActiveServerIDs = selectedOptions.map(item => item.value);
            if (isEqual(newActiveServerIDs, activeServerOptionsForSelectUI)) return;
            setActiveServers(newActiveServerIDs);
          }}
          options={availableServerOptions}
          className='mb-2'
          placeholder={t('SelectServers')}
        />
        <div className='flex justify-between space-x-2'>
          <button onClick={handleAutoSelect} className='p-2 border rounded bg-blue-500 text-white'>{t('Auto Select')}</button>
          <button onClick={handleManualSelect} className='p-2 border rounded bg-blue-500 text-white'>{t('Manual Select')}</button>
          <button onClick={handleBookmark} className='p-2 border rounded bg-blue-500 text-white'>{t('Bookmark')}</button>
        </div>
      </div>
    </div>
  );
}
