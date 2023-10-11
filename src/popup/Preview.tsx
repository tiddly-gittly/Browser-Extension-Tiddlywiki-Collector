import { Dispatch, SetStateAction } from 'react';

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export function Preview(props: { content: string; setContent: Dispatch<SetStateAction<string>> }) {
  if (!props.content) return null;
  return (
    <textarea
      className='w-96 popup-preview-container border-double border-4'
      value={props.content}
      onChange={(event) => {
        props.setContent(event.target.value);
      }}
    />
  );
}
