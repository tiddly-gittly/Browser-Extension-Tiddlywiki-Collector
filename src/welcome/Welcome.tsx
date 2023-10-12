import { useTranslation } from 'react-i18next';

export function Welcome() {
  const { t } = useTranslation();

  const openOptionsPage = () => {
    // Open the extension's options page
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className='flex flex-col h-screen items-center justify-center space-y-4'>
      <h1 className='text-xl font-bold'>{t('Welcome')}</h1>
      <h2 className='text-lg'>{t('WelcomeDescription')}</h2>
      <button onClick={openOptionsPage} className='px-4 py-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-400'>
        {t('Options')}
      </button>
    </div>
  );
}
