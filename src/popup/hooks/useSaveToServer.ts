/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { t } from 'i18next';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import delay from 'tiny-delay';
import { useAddTiddlerToServer } from '../../shared/hooks/useAddTiddlerToServer';
import { getAssetSafeTitle } from '../../utils';
import { Asset } from '../AssetTable';
import { useContentToSave } from './useContentToSave';
import { IContent } from './useTransformFormat';

export function useSaveToServer(assets: Asset[], content: IContent, selectedContentKey: keyof IContent, tagsForContent: string[], tagsForAssets: string[], title: string) {
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState('');

  const { addTiddlerToAllActiveServers } = useAddTiddlerToServer();

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
        caption: item.alt,
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
  }, [contentToSave, title, url, tagsForContent, contentMimeType, assetsToSave, tagsForAssets, addTiddlerToAllActiveServers]);

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
  }, [title, url, tagsForContent, contentMimeType, addTiddlerToAllActiveServers]);

  return {
    saving,
    setUrl,
    saveClipOfCurrentSelectedContent,
    handleBookmark,
  };
}
