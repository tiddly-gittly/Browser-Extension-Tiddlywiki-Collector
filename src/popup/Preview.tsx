import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { IContent } from './hooks/useTransformFormat';

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export function Preview(props: { content: IContent; setContent: Dispatch<SetStateAction<IContent>> }) {
  const { t } = useTranslation();
  if (!props.content) return null;
  return (
    <div className='w-96 popup-preview-container'>
      <Tabs className='w-full h-full'>
        <TabList>
          {Object.entries(props.content).map(([key, value]: string[]) => <Tab key={key}>{t(key)}</Tab>)}
        </TabList>

        {Object.entries(props.content).map(([key, value]: string[]) => (
          <TabPanel key={key}>
            <textarea
              className='w-full h-full p-2'
              value={value}
              onChange={(event) => {
                const newContent = { ...props.content, [key]: event.target.value };
                props.setContent(newContent);
              }}
            />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}
