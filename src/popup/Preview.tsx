import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { IContent } from './hooks/useTransformFormat';

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export function Preview(
  props: { content: IContent; selectedContentKey: keyof IContent; setContent: Dispatch<SetStateAction<IContent>>; setSelectedContentKey: (newType: keyof IContent) => void },
) {
  const { t } = useTranslation();
  if (!props.content) return null;
  const contentEntries = Object.entries(props.content);
  return (
    <div className='w-96 popup-preview-container'>
      <Tabs
        className='w-full h-full'
        selectedIndex={contentEntries.findIndex(([key]: string[]) => key === props.selectedContentKey)}
        onSelect={(index: number) => {
          contentEntries[index] && props.setSelectedContentKey(contentEntries[index][0] as keyof IContent);
        }}
      >
        <TabList>
          {contentEntries.map(([key]: string[]) => <Tab key={key}>{t(key)}</Tab>)}
        </TabList>

        {contentEntries.map(([key, value]: string[]) => (
          <TabPanel key={key}>
            <textarea
              className='w-full preview-text-area p-2'
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
