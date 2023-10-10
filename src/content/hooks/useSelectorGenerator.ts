import { getCssSelector } from 'css-selector-generator';
import { useState } from 'react';

export function useSelectorGenerator() {
  const [selector, setSelector] = useState<string | null>(null);

  const updateSelector = (element: HTMLElement) => {
    const newSelector = getCssSelector(element);
    setSelector(newSelector);
  };

  return { selector, updateSelector };
}
