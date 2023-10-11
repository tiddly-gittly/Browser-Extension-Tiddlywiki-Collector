/* eslint-disable unicorn/prefer-top-level-await */
import { preferenceStoreReadyPromise } from './preferences/store';
import { serverStoreReadyPromise } from './server';

export const storeReadyPromise = Promise.race([
  serverStoreReadyPromise,
  preferenceStoreReadyPromise,
]);
