import { useCallback } from 'react';
import { ITiddlerToAdd, useAddTiddlerToServer } from '../../shared/hooks/useAddTiddlerToServer';

export function useClipperActions(newTiddler: ITiddlerToAdd) {
  const { addTiddlerToAllActiveServers } = useAddTiddlerToServer();

  const adjustSelection = useCallback((/* parameters */) => {
    // Implement logic to adjust the selection based on user input
  }, []);

  const submitSelection = useCallback(async (selector: string) => {
    const selectedHTML = document.querySelector(selector)?.innerHTML ?? '';
    const newTiddlerWithText = { ...newTiddler, text: selectedHTML };
    await addTiddlerToAllActiveServers(newTiddlerWithText);
  }, [addTiddlerToAllActiveServers, newTiddler]);

  return { adjustSelection, submitSelection };
}
