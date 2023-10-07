import { useTranslation } from 'react-i18next';
import { Servers } from '../shared/server';

export function Options() {
  const { t } = useTranslation();
  return (
    <div className='flex h-screen items-center justify-center'>
      <h1>{t('Options')}</h1>
      <Servers />
    </div>
  );
}
