import { useState } from 'react';
import { Form } from './Form';
import { Preview } from './Preview';

import './popup.css';
import { usePreferenceStore } from '../shared/preferences/store';
import { IContent, useTransformFormat } from './hooks/useTransformFormat';

export function Popup() {
  const { setPreferredContentType, preferredContentType } = usePreferenceStore();
  const [content, setContent] = useState<IContent>({
    html: '',
  });
  const [selectedContentKey, setSelectedContentKey] = useState<keyof IContent>(preferredContentType ?? 'html');
  useTransformFormat(content, setContent, { toMd: true, toTid: true });
  return (
    <div className='flex flex-row items-start popup-container bg-transparent bg-opacity-0'>
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
  );
}
