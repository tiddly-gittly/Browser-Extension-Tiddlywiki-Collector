import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef } from 'react';
import { fetchAssets } from '../../shared/fetchAssets';
import { IGetReadabilityMessageResponse, IStartClippingNoManualSelectionResponseMessage, IStartClippingResponseMessage, ITabActions, ITabMessage } from '../../shared/message';

export function useMessaging(
  parameter: {
    cleanUp: () => void;
    parseReadability: () => IGetReadabilityMessageResponse['article'];
    selectedElementReference: MutableRefObject<HTMLElement | null>;
    setIsSelecting: Dispatch<SetStateAction<boolean>>;
  },
) {
  const parameterReference = useRef(parameter);
  parameterReference.current = parameter;
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message: ITabMessage, sender, sendResponse) => {
      const parameter = parameterReference.current;
      const manualClippingZoneDomNodeSelection = parameter.selectedElementReference.current;
      switch (message.action) {
        case ITabActions.startSelectingClippingZone: {
          parameter.setIsSelecting(true);
          break;
        }
        case ITabActions.startClipping: {
          parameter.setIsSelecting(false);
          const nativeSelectionRange = getNativeSelectionRange();
          if (manualClippingZoneDomNodeSelection !== null) {
            // If user select a dom node, we will try to get the content of that dom node.
            const selectedElement = manualClippingZoneDomNodeSelection;
            const text = selectedElement.textContent ?? '';
            const html = selectedElement.outerHTML;
            const response = { action: ITabActions.startClippingResponse, text, html } satisfies IStartClippingResponseMessage;
            parameter.cleanUp();
            sendResponse(response);
            // return the response instead of `sendResponse`, otherwise response will be `undefined` in firefox. In Chrome, `sendResponse` works fine.
            return response;
          } else if (nativeSelectionRange === undefined || nativeSelectionRange.collapsed) {
            // if no any selection, we will try to get the whole webpage content.
            const response = { action: ITabActions.startClippingResponse, noSelection: true } satisfies IStartClippingNoManualSelectionResponseMessage;
            parameter.cleanUp();
            sendResponse(response);
            return response;
          } else {
            // If user click on extension icon, we will try to get the pre-selected content in the webpage. So user can clip only a part of the webpage to create flash card.
            const clonedSelection = nativeSelectionRange.cloneContents();
            const div = document.createElement('div');
            div.append(clonedSelection);
            const html = div.innerHTML;
            const response = { action: ITabActions.startClippingResponse, text: nativeSelectionRange.toString(), html } satisfies IStartClippingResponseMessage;
            parameter.cleanUp();
            sendResponse(response);
            return response;
          }
        }
        case ITabActions.getReadability: {
          const article = parameter.parseReadability();
          // Get the current webpage URL
          const url = window.location.href;
          const response = { action: ITabActions.getReadabilityResponse, article, url };
          sendResponse(response);
          return response;
        }
        case ITabActions.getAssets: {
          const imageNodes = message.imageNodes;
          // Get images under webpage URL
          void fetchAssets(imageNodes).then(assets => {
            const response = { action: ITabActions.getAssetsResponse, assets };
            sendResponse(response);
          });
          // For async content, this indicates that the response will be sent asynchronously
          return true;
        }
      }
    });
  }, []);
}

function getNativeSelectionRange() {
  const nativeSelection = window.getSelection();
  let nativeSelectionRange: undefined | Range;
  try {
    nativeSelectionRange = nativeSelection?.getRangeAt?.(0);
  } catch {}
  if (nativeSelectionRange === undefined && nativeSelection !== null && nativeSelection.anchorNode !== null && nativeSelection?.focusNode !== null) {
    nativeSelectionRange = document.createRange();
    nativeSelectionRange.setStart(nativeSelection.anchorNode, nativeSelection.anchorOffset);
    nativeSelectionRange.setEnd(nativeSelection.focusNode, nativeSelection.focusOffset);
  }
  return nativeSelectionRange;
}
