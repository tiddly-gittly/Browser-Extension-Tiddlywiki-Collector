import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IGetReadabilityMessageResponse } from '../../shared/message';
import { IContent } from './useTransformFormat';

export function useSetContentFromArticle(setContent: Dispatch<SetStateAction<IContent>>, setTitle: Dispatch<SetStateAction<string>>) {
  const [article, setArticle] = useState<IGetReadabilityMessageResponse['article']>(null);

  // auto fill title and content
  useEffect(() => {
    if (article !== null) {
      setTitle(article.title);
      setContent({ html: article.content as string, text: article.textContent?.trim() });
    }
  }, [article, setContent, setTitle]);

  return { article, setArticle };
}
