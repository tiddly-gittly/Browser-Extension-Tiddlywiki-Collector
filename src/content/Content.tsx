/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useCallback, useEffect, useState } from 'react';
import { ITiddlerToAdd } from '../shared/hooks/useAddTiddlerToServer';
import { ITabActions, ITabMessage } from '../shared/message';
import { ClipperFrame } from './ClipperFrame';
import { useSelectorGenerator } from './hooks/useSelectorGenerator';

export function Content() {
  const [isClipping, setIsClipping] = useState(false);
  const [newTiddler, setNewTiddler] = useState<ITiddlerToAdd>();
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message: ITabMessage) => {
      switch (message.action) {
        case ITabActions.startClipping: {
          setIsClipping(true);
          setNewTiddler(message.newTiddler);
          break;
        }
      }
    });
  }, []);

  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const { selector, updateSelector } = useSelectorGenerator();

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

  useEffect(() => {
    const cleanUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleElementSelection);
    };
    if (isClipping) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleElementSelection);
    } else {
      cleanUp();
    }
    return cleanUp;
  }, [isClipping, handleElementSelection, handleMouseMove]);

  return (
    <div className='fixed z-[999] bottom-2 right-2 shadow-xl border-[1px] bg-white bg-opacity-10'>
      <ClipperFrame setIsClipping={setIsClipping} />
    </div>
  );
}
