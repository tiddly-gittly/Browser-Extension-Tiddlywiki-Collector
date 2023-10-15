import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface Asset {
  content: string;
  /** Mime type */
  contentType: string;
  encoding: 'base64' | 'utf8';
  id: string;
  isSelected: boolean;
  title: string;
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
  const [isSelectAll, setIsSelectAll] = useState(false);

  const toggleSelected = (id: string) => {
    setAssets(previousAssets => previousAssets.map(asset => asset.id === id ? { ...asset, isSelected: !asset.isSelected } : asset));
  };

  const toggleSelectedAll = () => {
    const newIsSelectAll = !isSelectAll;
    setIsSelectAll(newIsSelectAll);
    setAssets(previousAssets => previousAssets.map(asset => ({ ...asset, isSelected: newIsSelectAll })));
  };

  const selectAsset = (id: string) => {
    setFocusedAssetID(previousFocusedAssetID => previousFocusedAssetID === id ? null : id);
  };
  const selectedAsset = assets.find(asset => asset.id === focusedAssetID);

  return (
    <div className='flex flex-row w-full'>
      <div className={`flex ${selectedAsset === undefined ? 'w-full' : ''}`}>
        <table className='w-full border-collapse'>
          <thead className='h-7'>
            <tr className='border-b'>
              <th className='px-2 py-1'>
                <input
                  type='checkbox'
                  checked={isSelectAll}
                  onChange={toggleSelectedAll}
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
                  className='px-2 py-1'
                  onClick={() => {
                    toggleSelected(asset.id);
                  }}
                >
                  <input
                    type='checkbox'
                    checked={asset.isSelected}
                    onChange={() => {
                      toggleSelected(asset.id);
                    }}
                  />
                </td>
                <td
                  className='px-2 py-1 cursor-pointer'
                  onClick={() => {
                    selectAsset(asset.id);
                  }}
                >
                  <span className={`cursor-pointer ${focusedAssetID === asset.id ? 'font-bold' : ''}`}>{asset.title}</span>
                </td>
                <td className='px-2 py-1'>
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
        <div className='w-80 flex justify-center'>
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
