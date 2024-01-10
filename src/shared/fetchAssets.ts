/* eslint-disable unicorn/prefer-code-point */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import type { Image } from 'mdast';
import { Asset } from '../popup/AssetTable';

export const fetchAssets = async (imageNodes: Image[]) => {
  const newAssets: Array<Asset | undefined> = await Promise.all(imageNodes.map(async (node) => {
    try {
      /**
       * canvas.toDataURL() returns png by default.
       */
      const extension = 'png';
      const contentType = `image/${extension}`;
      // make content base64 using btoa, because in tiddlywiki it use base64
      // const imageContentBase64 = encodeBase64(imageContent);
      const imageContentBase64 = await toCanvasBase64(node.url);
      const asset: Asset = {
        id: node.url,
        // add unique hash string to prevent title conflict
        title: `${node.alt ?? ''}${cyrb53(imageContentBase64)}.${extension}`,
        url: node.url,
        alt: node.alt ?? '',
        type: 'image',
        content: imageContentBase64,
        encoding: 'base64',
        isToSave: false,
        isSelected: false,
        contentType,
      };
      return asset;
    } catch (error) {
      console.error("[Browser-Extension-Tiddlywiki-Collector] Can't fetch image, error:", error, 'Node is', node);
      return undefined;
    }
  }));
  return newAssets.filter(item => item !== undefined);
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

async function toCanvasBase64(url: string) {
  return await new Promise<string>((resolve, reject) => {
    const image = new Image();
    // fix `Uncaught DOMException: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.` by allowing CORS.
    image.crossOrigin = 'Anonymous';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    image.addEventListener('load', () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx?.drawImage(image, 0, 0);
      //  canvas.toDataURL() returns: data:[<mime type>];base64,[<base64-encoded data>] , need to get base64 part.
      const base64String = canvas.toDataURL().split(',')[1];
      resolve(base64String);
    });
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    image.onerror = (error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-argument
      reject(typeof error === 'string' ? new Error(error) : error as unknown as Error);
    };
    image.src = url;
  });
}
