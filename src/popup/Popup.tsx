import { useState } from 'react';
import { Form } from './Form';
import { Preview } from './Preview';

import './popup.css';

export function Popup() {
  const [content, setContent] = useState('');
  return (
    <div className='flex flex-row popup-container bg-transparent bg-opacity-0'>
      <Preview content={content} setContent={setContent} />
      <Form setContent={setContent} />
    </div>
  );
}
