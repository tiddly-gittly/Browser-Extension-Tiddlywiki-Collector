import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IGetReadabilityMessageResponse } from '../../shared/message';
import { makeSafeTitle } from '../../utils';
import { IContent } from './useTransformFormat';

export function useSetContentFromArticle(setContent: Dispatch<SetStateAction<IContent>>, setTitle: Dispatch<SetStateAction<string>>, inManualSelectMode: boolean) {
  const [article, setArticle] = useState<IGetReadabilityMessageResponse['article']>(null);

  // auto fill title and content
  useEffect(() => {
    if (article !== null) {
      setTitle(makeSafeTitle(article.title));
      if (!inManualSelectMode) {
        setContent({ html: article.content as string, text: article.textContent?.trim() });
      }
    }
  }, [article, inManualSelectMode, setContent, setTitle]);

  return { article, setArticle };
}
