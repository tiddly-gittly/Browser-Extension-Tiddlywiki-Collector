import type { Readability } from '@mozilla/readability';

export enum ITabActions {
  getReadability = 'getReadability',
  getReadabilityResponse = 'getReadabilityResponse',
  startClipping = 'startClipping',
  startClippingResponse = 'startClippingResponse',
  startSelecting = 'startSelecting',
}
export interface IStartSelectionMessage {
  action: ITabActions.startSelecting;
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
export type ITabMessage = IStartSelectionMessage | IGetReadabilityMessage | IGetReadabilityMessageResponse | IStartClippingMessage | IStartClippingResponseMessage | IStartClippingNoManualSelectionResponseMessage;
