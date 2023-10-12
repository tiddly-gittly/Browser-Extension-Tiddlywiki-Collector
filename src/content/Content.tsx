/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReadability } from '../shared/hooks/useReadability';
import { useMessaging } from './hooks/useMessaging';

const CLIPPER_MARK_HOVERED = 'tiddlywikiClipperHovered';

export function Content() {
  const { t } = useTranslation();
  const [isSelecting, setIsSelecting] = useState(false);
  const { parseReadability } = useReadability();
  const selectedElementReference = useRef<HTMLElement | null>(null);
  const previousHoveredElementReference = useRef<HTMLElement | null>(null);
  const previousHoveredElementOutlineReference = useRef<string>('');
  // TODO: get selector and enable KBD to move selection.
  // const { updateSelector } = useSelectorGenerator();

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const element = event.target as HTMLElement | null;
    if (element === null) return;
    if (previousHoveredElementReference.current === element) return;
    // restore previous element
    if (previousHoveredElementReference.current?.dataset?.[CLIPPER_MARK_HOVERED]) {
      previousHoveredElementReference.current.style.outline = previousHoveredElementOutlineReference.current;
    }
    // backup current element
    previousHoveredElementOutlineReference.current = element.style.outline ?? '';
    previousHoveredElementReference.current = element;
    // highlight current element
    element.style.outline = '2px solid blue'; // Highlight element
    element.dataset[CLIPPER_MARK_HOVERED] = 'true';
    // updateSelector(element); // Update the CSS selector
  }, []);
  const handleElementSelection = useCallback((event: MouseEvent) => {
    const element = event.target as HTMLElement | null;
    if (element === null) return;
    selectedElementReference.current = element;
    element.style.outline = '2px solid green'; // Highlight selected element
    // Stop highlighting on mouse move, but still allow click on other element to fix the selection.
    document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);
  const cleanUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleElementSelection);
    selectedElementReference.current = null;
    if (previousHoveredElementReference.current) {
      previousHoveredElementReference.current.style.outline = previousHoveredElementOutlineReference.current;
      previousHoveredElementReference.current = null;
    }
  }, [handleElementSelection, handleMouseMove]);
  useMessaging({ setIsSelecting, parseReadability, selectedElementReference, cleanUp });

  const handleCancelSelecting = useCallback(() => {
    setIsSelecting(false);
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
