/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReadability } from '../shared/hooks/useReadability';
import { useMessaging } from './hooks/useMessaging';
import { useSelectorGenerator } from './hooks/useSelectorGenerator';

export function Content() {
  const { t } = useTranslation();
  const [isSelecting, setIsSelecting] = useState(false);
  const { parseReadability } = useReadability();

  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  useMessaging({ setIsSelecting, parseReadability, selectedElement });
  const { updateSelector } = useSelectorGenerator();

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const element = event.target as HTMLElement | null;
    if (element === null) return;
    element.style.outline = '2px solid blue'; // Highlight element
    updateSelector(element); // Update the CSS selector
  }, [updateSelector]);
  const handleElementSelection = useCallback((event: MouseEvent) => {
    const element = event.target as HTMLElement | null;
    setSelectedElement(element);
    document.removeEventListener('mousemove', handleMouseMove); // Stop highlighting on mouse move
  }, [handleMouseMove]);
  const cleanUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleElementSelection);
  }, [handleElementSelection, handleMouseMove]);

  const handleCancelSelecting = useCallback(() => {
    setIsSelecting(false);
    setSelectedElement(null);
    cleanUp();
  }, [cleanUp]);

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleElementSelection);
    } else {
      cleanUp();
    }
    return cleanUp;
  }, [isSelecting, handleElementSelection, handleMouseMove, cleanUp]);

  if (!isSelecting) return null;
  return (
    <div className='fixed z-[999] top-2 right-2 shadow-xl border-[1px]'>
      <div className='flex flex-col instructions text-lg h-32 bg-white bg-opacity-70 p-3'>
        <p>{t('SelectElementToClip')}</p>
        <p>{t('OpenPopupToClipWhenDone')}</p>
        <button onClick={handleCancelSelecting} className='p-2 border rounded bg-red-300 text-white'>{t('Cancel')}</button>
      </div>
    </div>
  );
}
