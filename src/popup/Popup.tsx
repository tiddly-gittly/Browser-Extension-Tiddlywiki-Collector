import { useState } from 'react';
import { Form } from './Form';
import { Preview } from './Preview';

import './popup.css';
import { IContent, useTransformFormat } from './hooks/useTransformFormat';

export function Popup() {
  const [content, setContent] = useState<IContent>({
    html: '',
  });
  useTransformFormat(content, setContent, { toMd: true, toTid: true });
  return (
    <div className='flex flex-row popup-container bg-transparent bg-opacity-0'>
      <Preview content={content} setContent={setContent} />
      <Form setContent={setContent} />
    </div>
  );
}
