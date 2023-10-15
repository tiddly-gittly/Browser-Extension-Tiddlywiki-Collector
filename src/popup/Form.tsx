/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import isEqual from 'fast-deep-equal';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast, ToastContainer } from 'react-toastify';
import delay from 'tiny-delay';
import { useAddTiddlerToServer } from '../shared/hooks/useAddTiddlerToServer';
import { useAvailableTags } from '../shared/hooks/useAvailableTags';
import { usePreferenceStore } from '../shared/preferences/store';
import { getAssetSafeTitle } from '../utils';
import { Asset } from './AssetTable';
import { useContentToSave } from './hooks/useContentToSave';
import { useMessagingForm } from './hooks/useMessaging';
import { useSetContentFromArticle } from './hooks/useSetContentFromArticle';
import { IContent } from './hooks/useTransformFormat';

export function Form(props: { assets: Asset[]; content: IContent; selectedContentKey: keyof IContent; setContent: Dispatch<SetStateAction<IContent>> }) {
  const { setContent, selectedContentKey, content, assets } = props;
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [inManualSelectMode, setInManualSelectMode] = useState(false);
  const [url, setUrl] = useState('');
  const { defaultTagsForContent, defaultTagsForAssets } = usePreferenceStore();
  /** selected tags */
  const [tagsForContent, setTagsForContent] = useState<string[]>(defaultTagsForContent);
  const [tagsForAssets, setTagsForAssets] = useState<string[]>(defaultTagsForAssets);
  // if inManualSelectMode, don't set content from article, we will get content from user selection
  const { setArticle } = useSetContentFromArticle(setContent, setTitle, inManualSelectMode);
  const { handleManualSelect, handleGetReadability, handleGetSelectedHTML } = useMessagingForm({ setArticle, setUrl, setContent });
  // get readability on user first click on the popup
  useEffect(() => {
    void handleGetSelectedHTML().then(async (wasInManualSelectMode) => {
      setInManualSelectMode(wasInManualSelectMode);
      await handleGetReadability();
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

  const assetsToSave = useMemo(
    () => assets.filter(item => item.isToSave).map(item => ({ ...item, title: getAssetSafeTitle(title, item) })),
    [assets, title],
  );
  const contentToSave = useContentToSave(title, content, selectedContentKey, assetsToSave);
  const contentMimeType = useMemo(() => {
    switch (selectedContentKey) {
      case 'html': {
        // use tw5 syntax for html, so image and link syntax in it can be parsed.
        return 'text/vnd.tiddlywiki';
      }
      case 'markdown': {
        return 'text/markdown';
      }
      case 'wikitext': {
        return 'text/vnd.tiddlywiki';
      }
      default: {
        return 'text/plain';
      }
    }
  }, [selectedContentKey]);
  const saveClipOfCurrentSelectedContent = useCallback(async () => {
    if (contentToSave) {
      const newContentTiddler = { title, url, text: contentToSave, tags: tagsForContent, type: contentMimeType };
      const newAssetTiddlers = assetsToSave.map(item => ({
        title: item.title,
        url: item.url,
        text: item.content,
        type: item.contentType,
        tags: tagsForAssets,
      }));
      try {
        toast(t('AddStarting'));
        setSaving(true);
        await addTiddlerToAllActiveServers(newContentTiddler);
        await Promise.all(newAssetTiddlers.map(async item => {
          await addTiddlerToAllActiveServers(item);
        }));
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
  }, [contentToSave, t, title, url, tagsForContent, contentMimeType, assetsToSave, tagsForAssets, addTiddlerToAllActiveServers]);

  const handleBookmark = useCallback(async () => {
    const newTiddler = { title, url, tags: tagsForContent, text: `[ext[${title.replaceAll('|', '-')}|${url}]]`, type: contentMimeType };
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
  }, [title, url, tagsForContent, contentMimeType, t, addTiddlerToAllActiveServers]);

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
      <CreatableSelect
        isClearable
        isMulti
        value={tagsForContent.map(item => ({ value: item, label: item }))}
        onChange={(selectedOptions) => {
          setTagsForContent(selectedOptions.map(item => item.value));
        }}
        options={availableTagOptions}
        className='mb-2'
        placeholder={t('SelectTags')}
      />
      <CreatableSelect
        isClearable
        isMulti
        value={tagsForAssets.map(item => ({ value: item, label: item }))}
        onChange={(selectedOptions) => {
          setTagsForAssets(selectedOptions.map(item => item.value));
        }}
        options={availableTagOptions}
        className='mb-2'
        placeholder={t('SelectTagsForAssets')}
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
        <button onClick={handleBookmark} className={`p-2 border rounded ${saving ? 'bg-gray-600' : 'bg-blue-500 text-white'}`}>{t('Bookmark')}</button>
        <button onClick={handleManualSelect} className={`p-2 border rounded ${saving ? 'bg-gray-600' : 'bg-blue-500 text-white'}`}>{t('Manual Select')}</button>
      </div>
      <ToastContainer />
    </div>
  );
}
