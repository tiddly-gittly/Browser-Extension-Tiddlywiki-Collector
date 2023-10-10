/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en_UK from './en-UK/translation.json';
import zh_Hans from './zh-Hans/translation.json';

const resources = {
  en_UK: {
    translation: en_UK,
  },
  zh_Hans: {
    translation: zh_Hans,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: { // Options for language detection
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie'],
    },
  });

export { default } from 'i18next';
