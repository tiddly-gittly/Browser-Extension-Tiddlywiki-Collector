/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IServerInfo, ServerProvider, useServerStore } from '../shared/server/store';

export function ServersOptions() {
  const { servers, add, update, remove, clearAll, setActive } = useServerStore();
  const [newServerURI, setNewServerURI] = useState('');
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
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
    if (isConfirmDialogVisible) {
      clearAll();
      toggleConfirmDialog(); // Hide the dialog after action
    } else {
      toggleConfirmDialog(); // Show the dialog
    }
  };

  const toggleConfirmDialog = () => {
    setIsConfirmDialogVisible(previousState => !previousState);
  };

  return (
    <div className='flex flex-col p-4 bg-gray-100'>
      <h2 className='text-xl text-center pb-5'>{t('Server')}</h2>
      <div>
        <div className='flex items-center justify-center mb-4 space-x-2'>
          <input
            type='text'
            value={newServerURI}
            onChange={(event) => {
              setNewServerURI(event.target.value);
            }}
            placeholder={t('ServerURI')}
            className='w-full p-2 border border-gray-300 rounded-md'
          />
          <button onClick={handleAddServer} className='whitespace-nowrap px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-400'>
            {t('AddServer')}
          </button>
        </div>
        <div>
          {Object.values(servers).map(server => (
            <div key={server.id} className='mb-4 bg-white p-4 border border-gray-300 rounded-md'>
              <div className='flex justify-between'>
                <span className='text-gray-700'>{server.name} ({server.provider}) - {server.uri}</span>
                <div className='space-x-2'>
                  <button
                    onClick={() => {
                      handleToggleActive(server.id);
                    }}
                    className='text-blue-500 hover:underline'
                  >
                    {server.active ? t('Deactivate') : t('Activate')} {/* translated string */}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedServerId === server.id) {
                        setSelectedServerId(undefined);
                      } else {
                        setSelectedServerId(server.id);
                      }
                    }}
                    className='text-blue-500 hover:underline'
                  >
                    {selectedServerId === server.id ? t('DoneEdit') : t('Edit')}
                  </button>
                  <button
                    onClick={() => {
                      handleRemoveServer(server.id);
                    }}
                    className='text-red-500 hover:underline'
                  >
                    {t('Remove')}
                  </button>
                </div>
              </div>
              {selectedServerId === server.id && (
                <div className='mt-4'>
                  <div className='space-y-2'>
                    <input
                      type='text'
                      defaultValue={server.name}
                      onBlur={(event) => {
                        handleUpdateServer({ id: server.id, name: event.target.value });
                      }}
                      placeholder={t('ServerName')} // translated string
                      className='w-full p-2 border border-gray-300 rounded-md'
                    />
                    <select
                      defaultValue={server.provider}
                      onBlur={(event) => {
                        handleUpdateServer({ id: server.id, provider: event.target.value as ServerProvider });
                      }}
                      className='w-full p-2 border border-gray-300 rounded-md'
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
                      className='w-full p-2 border border-gray-300 rounded-md'
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleClearAllServers} className='mt-4 px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-400'>
          {t('ClearAllServers')}
        </button>
        {isConfirmDialogVisible && (
          <div className='fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50'>
            <div className='bg-white p-4 rounded-md'>
              <p className='mb-4'>Are you sure you want to clear all servers?</p>
              <div className='flex justify-between'>
                <button onClick={handleClearAllServers} className='px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-400'>
                  {t('Confirm')}
                </button>
                <button onClick={toggleConfirmDialog} className='px-4 py-2 font-bold text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200'>
                  {t('Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
