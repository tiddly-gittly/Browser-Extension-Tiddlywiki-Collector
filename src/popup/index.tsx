import '../global.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../i18n';
import { storeReadyPromise } from '../shared';
import { Popup } from './Popup';

// eslint-disable-next-line unicorn/prefer-top-level-await
void storeReadyPromise.then(() => {
  createRoot(document.querySelector('#root') as HTMLElement).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  );
});
