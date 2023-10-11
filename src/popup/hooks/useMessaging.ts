import { Dispatch, SetStateAction, useCallback } from 'react';
import { ITiddlerToAdd } from '../../shared/hooks/useAddTiddlerToServer';
import { IGetReadabilityMessageResponse, ITabActions, ITabMessage } from '../../shared/message';

export function useMessagingPopup(
  parameter: {
    newTiddler: ITiddlerToAdd;
    setArticle: Dispatch<SetStateAction<IGetReadabilityMessageResponse['article']>>;
    setUrl: Dispatch<SetStateAction<IGetReadabilityMessageResponse['url']>>;
  },
) {
  const { newTiddler, setArticle, setUrl } = parameter;
  const handleManualSelect = useCallback(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeID = tabs[0].id;
      if (activeID === undefined) return;
      await chrome.tabs.sendMessage<ITabMessage, undefined>(activeID, { action: ITabActions.startClipping, newTiddler: { ...newTiddler, type: 'text/vnd.tiddlywiki' } });
      window.close(); // Close the popup
    });
  }, [newTiddler]);
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

  return { handleManualSelect, handleGetReadability };
}
