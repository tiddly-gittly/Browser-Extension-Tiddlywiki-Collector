import { Dispatch, SetStateAction, useEffect } from 'react';
import { IGetReadabilityMessageResponse, IStartClippingResponseMessage, ITabActions, ITabMessage } from '../../shared/message';

export function useMessaging(
  parameter: {
    cleanUp: () => void;
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
        /**
         * we will try this when user click on extension icon. (whenever first-time or second-time, just try it)
         *
         * If `parameter.selectedElement` exists, means this is second-time (user open popup before and choose the "select manually", which is the first time.).
         */
        case ITabActions.startClipping: {
          parameter.cleanUp();
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
