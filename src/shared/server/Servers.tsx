/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IServerInfo, ServerProvider, useServerStore } from './store';

export function Servers() {
  const { servers, add, update, remove, clearAll, setActive } = useServerStore();
  const [newServerURI, setNewServerURI] = useState('');
  const [selectedServerId, setSelectedServerId] = useState<string | undefined>(undefined);
  const { t } = useTranslation();
  const handleAddServer = () => {
    if (newServerURI) {
      add({ uri: newServerURI });
      setNewServerURI(''); // Clear the input field
    }
  };

  const handleToggleActive = (id: string) => {
    const server = servers[id];
    if (server) {
      setActive(id, !server.active);
    }
  };

  const handleUpdateServer = (updatedServer: Partial<IServerInfo> & { id: string }) => {
    update(updatedServer);
  };

  const handleRemoveServer = (id: string) => {
    remove(id);
  };

  const handleClearAllServers = () => {
    clearAll();
  };

  return (
    <div className='p-2'>
      <div className='flex items-center justify-center mb-4'>
        <input
          type='text'
          value={newServerURI}
          onChange={(event) => {
            setNewServerURI(event.target.value);
          }}
          placeholder={t('ServerURI')}
          className='mr-2 border'
        />
        <button onClick={handleAddServer}>
          {t('AddServer')}
        </button>
      </div>
      <div>
        {Object.values(servers).map(server => (
          <div key={server.id} className='mb-2'>
            <div className='flex justify-between'>
              <span>{server.name} ({server.provider}) - {server.uri}</span>
              <div>
                <button
                  onClick={() => {
                    handleToggleActive(server.id);
                  }}
                >
                  {server.active ? t('Deactivate') : t('Activate')} {/* translated string */}
                </button>
                <button
                  onClick={() => {
                    setSelectedServerId(server.id);
                  }}
                >
                  {t('Edit')}
                </button>
                <button
                  onClick={() => {
                    handleRemoveServer(server.id);
                  }}
                >
                  {t('Remove')}
                </button>
              </div>
            </div>
            {selectedServerId === server.id && (
              <div className='mt-2'>
                <div className='mt-2'>
                  <input
                    type='text'
                    defaultValue={server.name}
                    onBlur={(event) => {
                      handleUpdateServer({ id: server.id, name: event.target.value });
                    }}
                    placeholder={t('ServerName')} // translated string
                    className='mr-2 border'
                  />
                  <select
                    defaultValue={server.provider}
                    onBlur={(event) => {
                      handleUpdateServer({ id: server.id, provider: event.target.value as ServerProvider });
                    }}
                    className='mr-2 border'
                  >
                    <option value={ServerProvider.TidGiDesktop}>{t('TidGiDesktop')}</option>
                    <option value={ServerProvider.TiddlyHost}>{t('TiddlyHost')}</option>
                  </select>
                  <input
                    type='text'
                    defaultValue={server.uri}
                    onBlur={(event) => {
                      handleUpdateServer({ id: server.id, uri: event.target.value });
                    }}
                    placeholder={t('ServerURI')} // translated string
                    className='border'
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={handleClearAllServers}>
        {t('ClearAllServers')}
      </button>
    </div>
  );
}
