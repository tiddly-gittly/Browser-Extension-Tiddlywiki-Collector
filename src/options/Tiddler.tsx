/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useAvailableTags } from '../shared/hooks/useAvailableTags';
import { possibleContentTypes, usePreferenceStore } from '../shared/preferences/store';

export function TiddlerOptions() {
  const { t } = useTranslation();
  const {
    defaultTagsForContent,
    setDefaultTagsForContent,
    preferredContentType,
    setPreferredContentType,
    defaultTagsForAssets,
    setDefaultTagsForAssets,
  } = usePreferenceStore();
  const availableTagOptions = useAvailableTags();
  return (
    <div className='p-4'>
      <div className='flex flex-col items-center justify-center mb-4 space-x-2'>
        <h2 className='text-xl'>{t('Tiddler')}</h2>
        <div className='w-full flex p-2 pl-1'>
          <h3 className='text-lg'>{t('DefaultTags')}</h3>
        </div>
        <CreatableSelect
          isClearable
          isMulti
          value={defaultTagsForContent.map(item => ({ value: item, label: item }))}
          onChange={(selectedOptions) => {
            setDefaultTagsForContent(selectedOptions.map(item => item.value));
          }}
          options={availableTagOptions}
          className='w-full'
          placeholder={t('SelectDefaultTags')}
        />
        <div className='w-full flex flex-col p-2 pl-1'>
          <h3 className='text-lg'>{t('DefaultTagsForAssets')}</h3>
          <p>{t('DefaultTagsForAssetsDescription')}</p>
        </div>
        <CreatableSelect
          isClearable
          isMulti
          value={defaultTagsForAssets.map(item => ({ value: item, label: item }))}
          onChange={(selectedOptions) => {
            setDefaultTagsForAssets(selectedOptions.map(item => item.value));
          }}
          options={availableTagOptions}
          className='w-full'
          placeholder={t('SelectDefaultTagsForAssets')}
        />
        <div className='w-full flex p-2 pl-1'>
          <h3 className='text-lg'>{t('PreferredContentType')}</h3>
        </div>
        <Select
          value={{ value: preferredContentType, label: preferredContentType }}
          onChange={(selectedOptions) => {
            setPreferredContentType(selectedOptions?.value ?? 'html');
          }}
          options={possibleContentTypes.map(item => ({ value: item, label: item }))}
          className='w-full'
          placeholder={t('PreferredContentType')}
        />
      </div>
    </div>
  );
}
