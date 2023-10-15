/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import type { Image } from 'mdast';
import { Asset } from '../popup/AssetTable';

export const fetchAssets = async (imageNodes: Image[]) => {
  const newAssets: Asset[] = await Promise.all(imageNodes.map(async (node) => {
    const imageURL = new URL(node.url);
    const { imageContent, contentType } = await fetch(imageURL).then(async response => ({
      // try to get content type from response header, otherwise we randomly set it to image/png
      // sometimes for jpg, it returns webp...
      contentType: response.headers.get('Content-Type') ?? 'image/png',
      imageContent: await (await response.blob()).text(),
    }));
    // fallback to content type if extension is not available
    const extension = imageURL.pathname.split('.').pop() ?? contentType.split('/').pop() ?? 'png';
    // make content base64 using btoa, because in tiddlywiki it use base64
    const encoder = new TextEncoder();
    const encodedImageContent = encoder.encode(imageContent);
    const imageContentBase64 = btoa(String.fromCodePoint(...encodedImageContent));
    const asset: Asset = {
      id: node.url,
      title: `${node.alt || cyrb53(imageContent)}.${extension}`,
      url: node.url,
      content: imageContentBase64,
      encoding: 'base64',
      isSaved: false,
      isSelected: false,
      contentType,
    };
    return asset;
  }));
  return newAssets;
};

/**
 * Hash function
 * @url https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */
const cyrb53 = (str: string, seed = 0): string => {
  let h1 = 0xDE_AD_BE_EF ^ seed;
  let h2 = 0x41_C6_CE_57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    // eslint-disable-next-line unicorn/prefer-code-point
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2_654_435_761);
    h2 = Math.imul(h2 ^ ch, 1_597_334_677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2_246_822_507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3_266_489_909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2_246_822_507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3_266_489_909);

  return String(4_294_967_296 * (2_097_151 & h2) + (h1 >>> 0));
};
