import { useState } from 'react';
import { Form } from './Form';
import { Preview } from './Preview';

import './popup.css';
import { usePreferenceStore } from '../shared/preferences/store';
import { AssetTable } from './AssetTable';
import { useAssets } from './hooks/useAssets';
import { useMessagingPopup } from './hooks/useMessaging';
import { IContent, useTransformFormat } from './hooks/useTransformFormat';

export function Popup() {
  const { setPreferredContentType, preferredContentType } = usePreferenceStore();
  const [content, setContent] = useState<IContent>({
    html: '',
  });
  const [selectedContentKey, setSelectedContentKey] = useState<keyof IContent>(preferredContentType ?? 'html');
  useTransformFormat(content, setContent, { toMd: true, toTid: true });
  const {
    assets,
    setAssets,
    focusedAssetID,
    setFocusedAssetID,
    imageNodes,
  } = useAssets(content);
  const { fetchingAssets } = useMessagingPopup({ setAssets, imageNodes });
  return (
    <div className='flex flex-col w-max popup-container'>
      <div className='flex flex-row h-full items-start'>
        <Preview
          content={content}
          setContent={setContent}
          selectedContentKey={selectedContentKey}
          setSelectedContentKey={(newType: keyof IContent) => {
            setSelectedContentKey(newType);
            setPreferredContentType(newType);
          }}
        />
        <Form content={content} setContent={setContent} selectedContentKey={selectedContentKey} />
      </div>
      <AssetTable fetchingAssets={fetchingAssets} assets={assets} setAssets={setAssets} focusedAssetID={focusedAssetID} setFocusedAssetID={setFocusedAssetID} />
    </div>
  );
}
