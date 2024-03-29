/* eslint-disable prefer-regex-literals */
/* eslint-disable security/detect-non-literal-regexp */
/* eslint-disable security-node/non-literal-reg-expr */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useMemo } from 'react';
import { Asset } from '../AssetTable';
import { IContent } from './useTransformFormat';

export function useContentToSave(noteTitle: string, content: IContent, selectedContentKey: keyof IContent, assets: Asset[]) {
  const contentToSave = useMemo(() => {
    const rawContent = content?.[selectedContentKey];
    if (rawContent === undefined) return undefined;
    const contentWithAssetsReplaced = assets.reduce((accumulator, asset) => {
      return replaceAnAsset(noteTitle, accumulator, selectedContentKey, asset);
    }, rawContent);
    return contentWithAssetsReplaced;
  }, [assets, content, noteTitle, selectedContentKey]);
  return contentToSave;
}

function replaceAnAsset(noteTitle: string, content: string, selectedContentKey: keyof IContent, asset: Asset): string {
  switch (asset.type) {
    case 'image': {
      switch (selectedContentKey) {
        case 'html': {
          return replaceAnImageInHTML(noteTitle, content, asset);
        }
        case 'markdown': {
          return replaceAnImageInMarkdown(noteTitle, content, asset);
        }
        case 'wikitext': {
          return replaceAnImageInWikitext(noteTitle, content, asset);
        }
        default: {
          return content;
        }
      }
    }
    default: {
      return content;
    }
  }
}

/**
 * Fix rehype-remark replace all `&amp;` in the source to `\&`, but we still can get real url from `asset.url`
 * @param url image url that might contains some special chars
 * @returns escape special chars
 * @url https://github.com/rehypejs/rehype-remark/issues/14
 */
function fixUrlEscape(url: string): string {
  return url.replaceAll('&', '\\&');
}

function replaceAnImageInMarkdown(noteTitle: string, content: string, asset: Asset): string {
  const stringToReplace = `![${asset.alt ?? ''}](${fixUrlEscape(asset.url)})`;
  return content.replaceAll(stringToReplace, `![${asset.alt ?? ''}](${asset.title})`);
}
function replaceAnImageInWikitext(noteTitle: string, content: string, asset: Asset): string {
  const stringToReplace = `[img[${fixUrlEscape(asset.url)}]]`;
  const alt = asset.alt ? `${asset.alt}|` : '';
  return content.replaceAll(stringToReplace, `[img[${alt}${asset.title}]]`);
}
function replaceAnImageInHTML(noteTitle: string, content: string, asset: Asset): string {
  // replace whole image tag to a p tag with image syntax `[img[title]]`
  const regex = new RegExp(`<img[^>]*src="([^"]*)"[^>]*>`, 'g');
  const alt = asset.alt ? `${asset.alt}|` : '';
  return content.replaceAll(regex, `<p>[img[${alt}${asset.title}]]</p>`);
}
