import { Dispatch, SetStateAction, useEffect } from 'react';
import { IGetReadabilityMessageResponse, IStartClippingResponseMessage, ITabActions, ITabMessage } from '../../shared/message';

export function useMessaging(
  parameter: {
    parseReadability: () => IGetReadabilityMessageResponse['article'];
    selectedElement: HTMLElement | null;
    setIsSelecting: Dispatch<SetStateAction<boolean>>;
  },
) {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(async (message: ITabMessage, sender, sendResponse) => {
      switch (message.action) {
        case ITabActions.startSelecting: {
          parameter.setIsSelecting(true);
          break;
        }
        case ITabActions.startClipping: {
          parameter.setIsSelecting(false);
          if (parameter.selectedElement === null) return;
          const text = parameter.selectedElement.textContent ?? '';
          const html = parameter.selectedElement.outerHTML;
          sendResponse({ action: ITabActions.startClippingResponse, text, html } satisfies IStartClippingResponseMessage);
          break;
        }
        case ITabActions.getReadability: {
          const article = parameter.parseReadability();
          // Get the current webpage URL
          const url = window.location.href;
          sendResponse({ action: ITabActions.getReadabilityResponse, article, url });
          break;
        }
      }
    });
  }, [parameter]);
}
