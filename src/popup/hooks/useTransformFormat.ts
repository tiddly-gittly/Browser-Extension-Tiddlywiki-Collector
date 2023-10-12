/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import useThrottledCallback from 'beautiful-react-hooks/useThrottledCallback';
import isEqual from 'fast-deep-equal';
import { md2tid } from 'md-to-tid';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export interface IContent {
  html: string;
  markdown?: string;
  text?: string;
  wikitext?: string;
}

const html2mdParser = unified()
  .use(rehypeParse)
  .use(rehypeRemark)
  .use(remarkStringify);

export function useTransformFormat(content: IContent, setContent: Dispatch<SetStateAction<IContent>>, options: { toMd: boolean; toTid: boolean }) {
  /** we only listen on content.html, so need a reference to the full object to access latest value */
  const contentReference = useRef(content);
  useEffect(() => {
    contentReference.current = content;
  }, [content]);
  const transformHTML = useThrottledCallback(async () => {
    const newContent = { ...contentReference.current };
    if (options.toMd && newContent.html) {
      const file = await html2mdParser.process(newContent.html);
      const newMarkdown = String(file);
      newContent.markdown = newMarkdown;
    }
    if (options.toTid && newContent.markdown) {
      const newTid = await md2tid(newContent.markdown);
      newContent.wikitext = newTid;
    }
    if (!isEqual(newContent, content)) {
      setContent(newContent);
    }
  }, [content.html, options.toMd, options.toTid, setContent]);
  useEffect(() => {
    void transformHTML();
    // don't add newContent.markdown or newContent.wikitext to the dependency array, to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.html, options.toMd, options.toTid]);
}
