/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useAvailableTags } from '../shared/hooks/useAvailableTags';
import { usePreferenceStore } from '../shared/preferences/store';

export function TiddlerOptions() {
  const { t } = useTranslation();
  const { defaultTags, setDefaultTags } = usePreferenceStore();
  const availableTagOptions = useAvailableTags();
  return (
    <div className='p-4'>
      <div className='flex flex-col items-center justify-center mb-4 space-x-2'>
        <Select
          isMulti
          value={defaultTags.map(item => ({ value: item, label: item }))}
          onChange={(selectedOptions) => {
            setDefaultTags(selectedOptions.map(item => item.value));
          }}
          options={availableTagOptions}
          className='w-full'
          placeholder={t('SelectDefaultTags')}
        />
      </div>
    </div>
  );
}
