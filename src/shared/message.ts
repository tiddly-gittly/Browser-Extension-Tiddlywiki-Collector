import type { Readability } from '@mozilla/readability';
import type { ITiddlerToAdd } from './hooks/useAddTiddlerToServer';

export enum ITabActions {
  getReadability = 'getReadability',
  getReadabilityResponse = 'getReadabilityResponse',
  startClipping = 'startClipping',
}
export interface IStartClippingMessage {
  action: ITabActions.startClipping;
  newTiddler: ITiddlerToAdd;
}
export interface IGetReadabilityMessage {
  action: ITabActions.getReadability;
}
export interface IGetReadabilityMessageResponse {
  action: ITabActions.getReadabilityResponse;
  article: ReturnType<typeof Readability.prototype.parse>;
  url: string;
}
export type ITabMessage = IStartClippingMessage | IGetReadabilityMessage | IGetReadabilityMessageResponse;
