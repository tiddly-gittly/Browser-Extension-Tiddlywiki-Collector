import { Dispatch, SetStateAction, useCallback } from 'react';
import { IGetReadabilityMessageResponse, IStartClippingResponseMessage, ITabActions, ITabMessage } from '../../shared/message';
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
  const handleGetReadability = useCallback(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeID = tabs[0].id;
      if (activeID === undefined) return;
      const response = await chrome.tabs.sendMessage<ITabMessage, IGetReadabilityMessageResponse>(activeID, { action: ITabActions.getReadability });
      if (response === undefined || response.action !== ITabActions.getReadabilityResponse) return;
      setArticle(response.article);
      setUrl(response.url);
    });
  }, [setArticle, setUrl]);
  /**
   * When the popup is opened (second time), we might have already selected an element in content script.
   */
  const handleGetSelectedHTML = useCallback(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeID = tabs[0].id;
      if (activeID === undefined) return;
      const response = await chrome.tabs.sendMessage<ITabMessage, IStartClippingResponseMessage>(activeID, { action: ITabActions.startClipping });
      if (response === undefined || response.action !== ITabActions.startClippingResponse) return;
      const { html, text } = response;
      parameter.setContent({
        html,
        text,
      });
    });
  }, [parameter]);

  return { handleManualSelect, handleGetReadability, handleGetSelectedHTML };
}
