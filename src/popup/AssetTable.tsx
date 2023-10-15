import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface Asset {
  alt?: string;
  content: string;
  /** Mime type */
  contentType: string;
  encoding: 'base64' | 'utf8';
  id: string;
  isSelected: boolean;
  isToSave: boolean;
  title: string;
  // TODO: support more asset types, such as video, audio, etc.
  type: 'image';
  url: string;
}

export interface AssetTableProps {
  assets: Asset[];
  fetchingAssets: boolean;
  focusedAssetID: string | null;
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  setFocusedAssetID: React.Dispatch<React.SetStateAction<string | null>>;
}

export function AssetTable({ fetchingAssets, assets, setAssets, focusedAssetID, setFocusedAssetID }: AssetTableProps) {
  const { t } = useTranslation();
  const [isToSaveAll, setIsToSaveAll] = useState(false);

  const toggleToSave = (id: string) => {
    setAssets(previousAssets => previousAssets.map(asset => asset.id === id ? { ...asset, isToSave: !asset.isToSave } : asset));
  };
  const setToSave = (id: string, isToSave: boolean) => {
    setAssets(previousAssets => previousAssets.map(asset => asset.id === id ? { ...asset, isToSave } : asset));
  };

  const toggleToSaveAll = () => {
    const newIsSelectAll = !isToSaveAll;
    setIsToSaveAll(newIsSelectAll);
    setAssets(previousAssets => previousAssets.map(asset => ({ ...asset, isToSave: newIsSelectAll })));
  };

  const toggleSelected = (id: string) => {
    setFocusedAssetID(previousFocusedAssetID => previousFocusedAssetID === id ? null : id);
  };
  const selectedAsset = assets.find(asset => asset.id === focusedAssetID);

  return (
    <div className='flex flex-row w-full'>
      <div className={`flex ${selectedAsset === undefined ? 'w-full' : ''}`}>
        <table className='w-full border-collapse'>
          <thead className='h-7'>
            <tr className='border-b'>
              <th className='px-2 py-1 text-center'>
                <input
                  type='checkbox'
                  checked={isToSaveAll}
                  onChange={toggleToSaveAll}
                />
              </th>
              <th className='px-2 py-1'>
                {fetchingAssets ? t('Loading') : t('AssetTableDescription')}
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr key={asset.id} className='border-b'>
                <td
                  className='px-2 py-1 text-center'
                  onClick={() => {
                    toggleToSave(asset.id);
                  }}
                >
                  <input
                    className='cursor-pointer'
                    type='checkbox'
                    checked={asset.isToSave}
                    onChange={(event) => {
                      event.stopPropagation();
                      setToSave(asset.id, event.target.checked);
                    }}
                  />
                </td>
                <td
                  className='px-2 py-1 cursor-pointer'
                  onClick={() => {
                    toggleSelected(asset.id);
                  }}
                >
                  <span className={`cursor-pointer ${focusedAssetID === asset.id ? 'font-bold' : ''}`}>{asset.title}</span>
                </td>
                <td
                  className='px-2 py-1 cursor-pointer'
                  onClick={() => {
                    toggleSelected(asset.id);
                  }}
                >
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className='w-16 h-16 object-cover'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedAsset !== undefined && (
        <div
          className='w-80 flex justify-center cursor-pointer'
          onClick={() => {
            toggleSelected(selectedAsset.id);
          }}
        >
          <img
            src={selectedAsset.url}
            alt={selectedAsset.title}
            className='w-max object-cover'
          />
        </div>
      )}
    </div>
  );
}
