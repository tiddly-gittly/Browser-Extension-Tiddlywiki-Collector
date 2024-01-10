import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import {
  IGetAssetsMessage,
  IGetAssetsMessageResponse,
  IGetReadabilityMessageResponse,
  IStartClippingNoManualSelectionResponseMessage,
  IStartClippingResponseMessage,
  ITabActions,
  ITabMessage,
} from '../../shared/message';
import { IContent } from './useTransformFormat';

export function useMessagingForm(
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
      await chrome.tabs.sendMessage<ITabMessage, undefined>(activeID, { action: ITabActions.startSelectingClippingZone });
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

export function useMessagingPopup(
  parameter: {
    imageNodes: IGetAssetsMessage['imageNodes'];
    setAssets: Dispatch<SetStateAction<IGetAssetsMessageResponse['assets']>>;
  },
) {
  const [fetchingAssets, setFetchingAssets] = useState(false);
  const { setAssets, imageNodes } = parameter;
  const handleGetAssets = useCallback(async (imageNodesToGet: typeof imageNodes) => {
    if (fetchingAssets) return;
    await new Promise<void>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeID = tabs[0].id;
        if (activeID === undefined) return;
        setFetchingAssets(true);
        try {
          const response = await chrome.tabs.sendMessage<ITabMessage, IGetAssetsMessageResponse>(activeID, { action: ITabActions.getAssets, imageNodes: imageNodesToGet });
          if (response === undefined || response.action !== ITabActions.getAssetsResponse) return;
          const assets = response.assets;
          setAssets(assets);
          setFetchingAssets(false);
          resolve();
        } catch (error) {
          setFetchingAssets(false);
          console.error(error);
          resolve();
        }
      });
      setTimeout(() => {
        setFetchingAssets(false);
        resolve();
      }, 1000);
    });
  }, [setAssets, fetchingAssets]);
  // use ref to prevent function ref change cause use effect re run
  const handleGetAssetsReference = useRef(handleGetAssets);
  handleGetAssetsReference.current = handleGetAssets;
  useEffect(() => {
    if (imageNodes.length > 0) {
      void handleGetAssetsReference.current?.(imageNodes);
    }
  }, [imageNodes]);

  return { handleGetAssets, fetchingAssets };
}
