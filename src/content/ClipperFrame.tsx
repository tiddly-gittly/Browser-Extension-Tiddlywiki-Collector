import { Dispatch, SetStateAction } from 'react';
import Frame from 'react-frame-component';
import { useTranslation } from 'react-i18next';
import { IGetReadabilityMessageResponse } from '../shared/message';

interface IProps {
  article: IGetReadabilityMessageResponse['article'];
  setIsClipping: Dispatch<SetStateAction<boolean>>;
}
export function ClipperFrame(props: IProps) {
  const { t } = useTranslation();
  return (
    <Frame>
      {/* Render your UI here, possibly passing selectedElement as a prop to other components */}
      <div className='instructions'>
        {t('Select an element on the page to clip...')}
      </div>
    </Frame>
  );
}
