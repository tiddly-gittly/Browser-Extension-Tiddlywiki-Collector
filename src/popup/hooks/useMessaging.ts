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

const MESSAGE_TIMEOUT_MS = 1000;

function parseTabIdFromQuery(): number | undefined {
  const tabIdRaw = new URLSearchParams(window.location.search).get('tabId');
  if (!tabIdRaw) {
    return undefined;
  }
  const tabId = Number(tabIdRaw);
  if (!Number.isInteger(tabId)) {
    return undefined;
  }
  return tabId;
}

async function getTargetTabId(): Promise<number | undefined> {
  const tabIdFromQuery = parseTabIdFromQuery();
  if (tabIdFromQuery !== undefined) {
    return tabIdFromQuery;
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id;
}

function withTimeout<T>(task: Promise<T>, timeoutMs = MESSAGE_TIMEOUT_MS): Promise<T | undefined> {
  return Promise.race([
    task,
    new Promise<undefined>(resolve => setTimeout(resolve, timeoutMs)),
  ]);
}

export function useMessagingForm(
  parameter: {
    setArticle: Dispatch<SetStateAction<IGetReadabilityMessageResponse['article']>>;
    setContent: Dispatch<SetStateAction<IContent>>;
    setUrl: Dispatch<SetStateAction<IGetReadabilityMessageResponse['url']>>;
  },
) {
  const { setArticle, setUrl } = parameter;
  const handleManualSelect = useCallback(async () => {
    const activeID = await getTargetTabId();
    if (activeID === undefined) return;
    try {
      await chrome.tabs.sendMessage<ITabMessage, undefined>(activeID, { action: ITabActions.startSelectingClippingZone });
      window.close();
    } catch (error) {
      console.error('[popup] startSelectingClippingZone failed', error);
    }
  }, []);
  // TODO: if permission is not granted, first content script injection will failed, and don't have a chance to re-inject. Ask user to refresh page.
  const handleGetReadability = useCallback(async () => {
    const activeID = await getTargetTabId();
    if (activeID === undefined) return;
    try {
      const response = await withTimeout(
        chrome.tabs.sendMessage<ITabMessage, IGetReadabilityMessageResponse>(activeID, { action: ITabActions.getReadability }),
      );
      if (response !== undefined && response.action === ITabActions.getReadabilityResponse) {
        setArticle(response.article);
        setUrl(response.url);
      }
    } catch (error) {
      console.error('[popup] getReadability failed', error);
    }
  }, [setArticle, setUrl]);
  /**
   * When the popup is opened (second time), we might have already selected an element in content script.
   * @returns we were in manual select mode.
   */
  const handleGetSelectedHTML = useCallback(async () => {
    const activeID = await getTargetTabId();
    if (activeID === undefined) {
      return false;
    }

    try {
      const response = await withTimeout(
        chrome.tabs.sendMessage<ITabMessage, IStartClippingResponseMessage | IStartClippingNoManualSelectionResponseMessage>(activeID, {
          action: ITabActions.startClipping,
        }),
      );
      if (response === undefined || response.action !== ITabActions.startClippingResponse) {
        return false;
      }
      if ('noSelection' in response) {
        return false;
      }
      const { html, text } = response;
      parameter.setContent({ html, text });
      return true;
    } catch (error) {
      console.error('[popup] startClipping failed', error);
      return false;
    }
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
    const activeID = await getTargetTabId();
    if (activeID === undefined) {
      return;
    }
    setFetchingAssets(true);
    try {
      const response = await withTimeout(
        chrome.tabs.sendMessage<ITabMessage, IGetAssetsMessageResponse>(activeID, { action: ITabActions.getAssets, imageNodes: imageNodesToGet }),
      );
      if (response !== undefined && response.action === ITabActions.getAssetsResponse) {
        setAssets(response.assets);
      }
    } catch (error) {
      console.error('[popup] getAssets failed', error);
    } finally {
      setFetchingAssets(false);
    }
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
