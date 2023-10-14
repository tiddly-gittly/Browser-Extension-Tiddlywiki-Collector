import { Dispatch, SetStateAction, useCallback } from 'react';
import { IGetReadabilityMessageResponse, IStartClippingNoManualSelectionResponseMessage, IStartClippingResponseMessage, ITabActions, ITabMessage } from '../../shared/message';
import { IContent } from './useTransformFormat';

export function useMessagingPopup(
  parameter: {
    setArticle: Dispatch<SetStateAction<IGetReadabilityMessageResponse['article']>>;
    setContent: Dispatch<SetStateAction<IContent>>;
    setUrl: Dispatch<SetStateAction<IGetReadabilityMessageResponse['url']>>;
  },
) {
  const { setArticle, setUrl } = parameter;
  const handleManualSelect = useCallback(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeID = tabs[0].id;
      if (activeID === undefined) return;
      await chrome.tabs.sendMessage<ITabMessage, undefined>(activeID, { action: ITabActions.startSelecting });
      window.close(); // Close the popup
    });
  }, []);
  // TODO: if permission is not granted, first content script injection will failed, and don't have a chance to re-inject. Ask user to refresh page.
  const handleGetReadability = useCallback(async () => {
    await new Promise<void>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeID = tabs[0].id;
        if (activeID === undefined) return;
        const response = await chrome.tabs.sendMessage<ITabMessage, IGetReadabilityMessageResponse>(activeID, { action: ITabActions.getReadability });
        if (response === undefined || response.action !== ITabActions.getReadabilityResponse) return;
        setArticle(response.article);
        setUrl(response.url);
        resolve();
      });
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }, [setArticle, setUrl]);
  /**
   * When the popup is opened (second time), we might have already selected an element in content script.
   * @returns we were in manual select mode.
   */
  const handleGetSelectedHTML = useCallback(async () => {
    return await new Promise<boolean>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeID = tabs[0].id;
        if (activeID === undefined) {
          // this callback might be call several times by other messages, so can't return false here. Only by timeout.
          return;
        }
        const response = await chrome.tabs.sendMessage<ITabMessage, IStartClippingResponseMessage | IStartClippingNoManualSelectionResponseMessage>(activeID, {
          action: ITabActions.startClipping,
        });
        if (response === undefined || response.action !== ITabActions.startClippingResponse) {
          return;
        }
        if ('noSelection' in response) {
          resolve(false);
        } else {
          const { html, text } = response;
          parameter.setContent({
            html,
            text,
          });
          resolve(true);
        }
      });
    });
  }, [parameter]);

  return { handleManualSelect, handleGetReadability, handleGetSelectedHTML };
}
