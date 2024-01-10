/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import cloneDeepRaw from 'rfdc';
import { wrapStore } from 'webext-zustand';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getExtensionStorage } from '../../utils/extensionStorage';

const cloneDeep = cloneDeepRaw();

export enum ServerStatus {
  disconnected = 'disconnected',
  online = 'online',
}
export enum ServerProvider {
  TidGiDesktop = 'TidGi-Desktop',
  TiddlyHost = 'TiddlyHost',
}
export interface IServerInfo {
  active: boolean;
  id: string;
  name: string;
  provider: ServerProvider;
  /**
   * Is it online or disconnected
   */
  status: ServerStatus;
  uri: string;
}

export interface ServerState {
  servers: Record<string, IServerInfo>;
}
const defaultServer: ServerState = {
  servers: {},
};
interface ServerActions {
  add: (newServer: Partial<IServerInfo> & { uri: string }) => void;
  clearAll: () => void;
  remove: (id: string) => void;
  setActive: (id: string, active: boolean) => void;
  update: (newServer: Partial<IServerInfo> & { id: string }) => void;
}

export const useServerStore = create<ServerState & ServerActions>()(
  immer(devtools(
    persist(
      (set) => ({
        ...defaultServer,
        setActive: (id, active) => {
          set((state) => {
            const server = state.servers[id];

            if (server) {
              server.active = active;
            }
          });
        },
        add: (partialServer) => {
          const id = String(Math.random()).substring(2, 7);
          const name = `TidGi-Desktop ${id}`;
          const newServer: IServerInfo = {
            id,
            name,
            active: true,
            status: ServerStatus.online,
            provider: ServerProvider.TidGiDesktop,
            ...partialServer,
          };
          set((state) => {
            const existingServerWithSameOrigin = Object.values(state.servers).find(
              (server) => server.uri === partialServer.uri,
            );
            if (existingServerWithSameOrigin !== undefined) {
              return;
            }
            state.servers[id] = newServer;
          });
        },
        update: (newServer) => {
          set((state) => {
            const oldServer = state.servers[newServer.id];
            if (oldServer !== undefined) {
              state.servers[newServer.id] = { ...oldServer, ...newServer };
            }
          });
        },
        clearAll: () => {
          set(() => defaultServer);
        },
        remove: (id) => {
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete state.servers[id];
          });
        },
      }),
      {
        name: 'server-storage',
        storage: createJSONStorage(() => getExtensionStorage('server-storage')),
      },
    ),
  )),
);

export const serverStoreReadyPromise = wrapStore(useServerStore);
