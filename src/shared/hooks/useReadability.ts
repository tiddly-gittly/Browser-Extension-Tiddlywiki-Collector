import { Readability } from '@mozilla/readability';
import { useCallback } from 'react';
// import { IGetReadabilityMessageResponse } from '../message';

export function useReadability() {
  // const [article, setArticle] = useState<IGetReadabilityMessageResponse['article']>(null);
  const parseReadability = useCallback(() => {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();
    // if (article !== null) {
    //   setArticle(article);
    // }
    return article;
  }, []);
  return {
    // article,
    parseReadability,
  };
}
