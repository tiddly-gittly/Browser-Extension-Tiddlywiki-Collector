/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Readability } from '@mozilla/readability';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useAddTiddlerToServer } from '../shared/hooks/useAddTiddlerToServer';
import { useAvailableTags } from '../shared/hooks/useAvailableTags';
import { IGetReadabilityMessageResponse } from '../shared/message';
import { useMessagingPopup } from './hooks/useMessaging';

export function Popup() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  /** selected tags */
  const [tags, setTags] = useState<string[]>([]);
  const [article, setArticle] = useState<IGetReadabilityMessageResponse['article']>(null);

  const [servers, setServers] = useState<string[]>([]);
  // Get the current webpage URL
  const url = window.location.href;

  const { handleManualSelect, handleGetReadability } = useMessagingPopup({ newTiddler: { title, url, tags }, setArticle });
  // get readability on user first click on the popup
  useEffect(() => {
    void handleGetReadability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // auto fill title and content
  useEffect(() => {
    if (article !== null) {
      setTitle(article.title);
      setContent(article.content as string);
    }
  }, [article]);

  const { activeServers, addTiddlerToAllActiveServers } = useAddTiddlerToServer();
  // DEBUG: console activeServers
  console.log(`activeServers`, activeServers);
  useEffect(() => {
    setServers(activeServers.map(item => item.id));
    // FIXME: activeServers cause rerender
  }, []);

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
          value={selectedServerDataForSelectUI}
          onChange={(selectedOptions) => {
            setServers(selectedOptions.map(item => item.value));
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
