import { Dispatch, SetStateAction, useEffect } from 'react';
import { ITiddlerToAdd } from '../../shared/hooks/useAddTiddlerToServer';
import { IGetReadabilityMessageResponse, ITabActions, ITabMessage } from '../../shared/message';

export function useMessaging(
  parameter: {
    parseReadability: () => IGetReadabilityMessageResponse['article'];
    setIsClipping: Dispatch<SetStateAction<boolean>>;
    setNewTiddler: Dispatch<SetStateAction<ITiddlerToAdd | undefined>>;
  },
) {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(async (message: ITabMessage, sender, sendResponse) => {
      switch (message.action) {
        case ITabActions.startClipping: {
          parameter.setIsClipping(true);
          parameter.setNewTiddler(message.newTiddler);
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
