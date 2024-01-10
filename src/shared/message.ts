import type { Readability } from '@mozilla/readability';
import type { Image } from 'mdast';
import { Asset } from '../popup/AssetTable';

export enum ITabActions {
  /**
   * Given some image nodes (metadata and image url), ask content script to return the asset items, containing the actual image content.
   */
  getAssets = 'getAssets',
  /**
   * Response of `getAssets`, alone with actual image content.
   */
  getAssetsResponse = 'getAssetsResponse',
  /**
   * Get overall metadata and main content of the webpage.
   */
  getReadability = 'getReadability',
  /**
   * Response of `getReadability`, alone with the metadata and main content of the webpage.
   */
  getReadabilityResponse = 'getReadabilityResponse',
  /**
   * we will try this when user click on extension icon. (whenever first-time or second-time, just try it)
   *
   * If `parameter.selectedElement` exists, means this is second-time (user open popup before and choose the "select manually", which is the first time.).
   *
   * Also will check if there is any user selection (native selection) in the webpage. If there is, we will try to get the content of the selection.
   */
  startClipping = 'startClipping',

  startClippingResponse = 'startClippingResponse',
  /**
   * Start manual selection of clipping zone. Trigger by clicking 'select manually' in popup.
   * Then user can select a dom node of the webpage, and get content of that dom node.
   */
  startSelectingClippingZone = 'startSelecting',
}
export interface IStartSelectionMessage {
  action: ITabActions.startSelectingClippingZone;
}
export interface IStartClippingMessage {
  action: ITabActions.startClipping;
}
export interface IStartClippingResponseMessage {
  action: ITabActions.startClippingResponse;
  html: string;
  text: string;
}
export interface IStartClippingNoManualSelectionResponseMessage {
  action: ITabActions.startClippingResponse;
  noSelection: true;
}
export interface IGetReadabilityMessage {
  action: ITabActions.getReadability;
}
export interface IGetReadabilityMessageResponse {
  action: ITabActions.getReadabilityResponse;
  article: ReturnType<typeof Readability.prototype.parse>;
  url: string;
}
export interface IGetAssetsMessage {
  action: ITabActions.getAssets;
  imageNodes: Image[];
}
export interface IGetAssetsMessageResponse {
  action: ITabActions.getAssetsResponse;
  assets: Asset[];
}
export type ITabMessage =
  | IStartSelectionMessage
  | IGetReadabilityMessage
  | IGetReadabilityMessageResponse
  | IGetAssetsMessage
  | IGetAssetsMessageResponse
  | IStartClippingMessage
  | IStartClippingResponseMessage
  | IStartClippingNoManualSelectionResponseMessage;
