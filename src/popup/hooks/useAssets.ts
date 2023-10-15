/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import isEqual from 'fast-deep-equal';
import type { Image } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { useEffect, useState } from 'react';
import { visit } from 'unist-util-visit';
import { Asset } from '../AssetTable';
import { IContent } from './useTransformFormat';

export function useAssets(
  content: IContent,
) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [imageNodes, setImageNodes] = useState<Image[]>([]);
  const [focusedAssetID, setFocusedAssetID] = useState<string | null>(null);
  // update imageNode, it will trigger `handleGetAssets` in `useMessagingPopup`, then `setAssets` gets called there.
  useEffect(() => {
    if (content.markdown) {
      const mdast = fromMarkdown(content.markdown);
      const newImageNodes: Image[] = [];
      visit(mdast, 'image', (node) => {
        newImageNodes.push(node);
      });
      if (!isEqual(newImageNodes, imageNodes)) {
        setImageNodes(newImageNodes);
      }
    }
  }, [content.markdown, imageNodes]);
  return {
    assets,
    setAssets,
    focusedAssetID,
    setFocusedAssetID,
    imageNodes,
    setImageNodes,
  };
}
