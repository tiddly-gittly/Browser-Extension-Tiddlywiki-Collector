/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Readability } from '@mozilla/readability';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import type { ITiddlerFields } from 'tw5-typed';
import { useAddTiddlerToServer } from '../shared/hooks/useAddTiddlerToServer';
import { useServerStore } from '../shared/server';

export function Content() {
  const { t } = useTranslation();

  const handleManualSelect = useCallback(async () => {
    yourDOMPickerFunction((selectedContent) => {
      window.close(); // Close the popup
    });
    const newTiddler = { title, text: selectedContent, url, tags, type: 'text/vnd.tiddlywiki' };
    await addTiddlerToAllActiveServers(newTiddler);
  }, [title, url, tags, addTiddlerToAllActiveServers]);


  return (
    <div className='fixed z-[999] bottom-2 right-2 shadow-xl border-[1px] bg-white bg-opacity-10'>
      
    </div>
  );
}
