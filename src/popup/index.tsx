import '../global.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { counterStoreReadyPromise } from '../shared/counter';
import Popup from './Popup';

// eslint-disable-next-line unicorn/prefer-top-level-await
void counterStoreReadyPromise.then(() => {
  createRoot(document.querySelector('#root') as HTMLElement).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  );
});
