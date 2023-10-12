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
          const response = { action: ITabActions.startClippingResponse, text, html } satisfies IStartClippingResponseMessage;
          sendResponse(response);
          // return the response instead of `sendResponse`, otherwise response will be `undefined` in firefox. In Chrome, `sendResponse` works fine.
          return response;
        }
        case ITabActions.getReadability: {
          const article = parameter.parseReadability();
          // Get the current webpage URL
          const url = window.location.href;
          const response = { action: ITabActions.getReadabilityResponse, article, url };
          sendResponse(response);
          return response;
        }
      }
    });
  }, [parameter]);
}
