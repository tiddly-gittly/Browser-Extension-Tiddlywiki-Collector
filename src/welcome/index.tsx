import '../global.css';
import React from 'react';
import '../i18n';
import { createRoot } from 'react-dom/client';
import { Welcome } from './Welcome';

createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <Welcome />
  </React.StrictMode>,
);
