import { ITiddlerToAdd } from './hooks/useAddTiddlerToServer';

export enum ITabActions {
  startClipping = 'startClipping',
}
export interface ITabMessageBase {
  action: ITabActions;
}
export interface IStartClippingMessage extends ITabMessageBase {
  newTiddler: ITiddlerToAdd;
}
export type ITabMessage = IStartClippingMessage;
