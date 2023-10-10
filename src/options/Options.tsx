import { useTranslation } from 'react-i18next';
import { Servers } from '../shared/server';

export function Options() {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-2xl p-4 bg-white rounded-lg shadow-lg'>
        <h1 className='text-2xl font-bold text-center text-gray-700 mb-4'>{t('Options')}</h1>
        <Servers />
      </div>
    </div>
  );
}
