/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import isEqual from 'fast-deep-equal';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import delay from 'tiny-delay';
import { useAddTiddlerToServer } from '../shared/hooks/useAddTiddlerToServer';
import { useAvailableTags } from '../shared/hooks/useAvailableTags';
import { usePreferenceStore } from '../shared/preferences/store';
import { useMessagingPopup } from './hooks/useMessaging';
import { useSetContentFromArticle } from './hooks/useSetContentFromArticle';
import { IContent } from './hooks/useTransformFormat';

export function Form(props: { content: IContent; selectedContentKey: string; setContent: Dispatch<SetStateAction<IContent>> }) {
  const { setContent, selectedContentKey, content } = props;
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState('');
  const { defaultTags } = usePreferenceStore();
  /** selected tags */
  const [tags, setTags] = useState<string[]>(defaultTags);
  const { setArticle } = useSetContentFromArticle(setContent, setTitle);
  const { handleManualSelect, handleGetReadability, handleGetSelectedHTML } = useMessagingPopup({ setArticle, setUrl, setContent });
  // get readability on user first click on the popup
  useEffect(() => {
    void handleGetSelectedHTML().then(async (wasInManualSelectMode) => {
      if (!wasInManualSelectMode) {
        await handleGetReadability();
      }
    });
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

  const contentToSave = content?.[selectedContentKey as keyof IContent];
  const saveClipOfCurrentSelectedContent = useCallback(async () => {
    if (contentToSave) {
      const newTiddler = { title, url, text: contentToSave, tags, type: 'text/vnd.tiddlywiki' };
      try {
        toast(t('AddStarting'));
        setSaving(true);
        await addTiddlerToAllActiveServers(newTiddler);
      } catch {
        toast(t('AddFailed'), { role: 'error' });
        return;
      } finally {
        setSaving(false);
      }
    }
    toast(t('AddSuccess'));
    // delay the close, so user see the popup
    await delay(1000);
    window.close(); // Close the popup
  }, [contentToSave, t, title, url, tags, addTiddlerToAllActiveServers]);

  const handleBookmark = useCallback(async () => {
    const newTiddler = { title, url, tags, text: `[ext[${title.replaceAll('|', '-')}|${url}]]`, type: 'text/vnd.tiddlywiki' };
    try {
      toast(t('AddStarting'));
      setSaving(true);
      await addTiddlerToAllActiveServers(newTiddler);
    } catch {
      toast(t('AddFailed'), { role: 'error' });
      return;
    } finally {
      setSaving(false);
    }
    toast(t('AddSuccess'));
    // delay the close, so user see the popup
    await delay(1000);
    window.close(); // Close the popup
  }, [title, url, tags, t, addTiddlerToAllActiveServers]);

  return (
    <div className='form-container flex flex-col justify-between p-4 w-80 shadow-xl border-[1px] bg-white bg-opacity-10'>
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
        <button onClick={saveClipOfCurrentSelectedContent} disabled={saving} className={`p-2 border rounded ${saving ? 'bg-gray-600' : 'bg-green-600'} text-white`}>
          {t('ClipSelected')}
        </button>
        <button onClick={handleBookmark} className={`p-2 border rounded ${saving ? 'bg-gray-600' : 'bg-blue-600'}`}>{t('Bookmark')}</button>
        <button onClick={handleManualSelect} className={`p-2 border rounded ${saving ? 'bg-gray-600' : 'bg-blue-600'}`}>{t('Manual Select')}</button>
      </div>
      <ToastContainer />
    </div>
  );
}
