/* eslint-disable unicorn/prefer-code-point */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import type { Image } from 'mdast';
import { Asset } from '../popup/AssetTable';

export const fetchAssets = async (imageNodes: Image[]) => {
  const newAssets: Asset[] = await Promise.all(imageNodes.map(async (node) => {
    const imageURL = new URL(node.url);
    // const { imageContentBlob, contentType } = await fetch(imageURL).then(async response => ({
    //   // try to get content type from response header, otherwise we randomly set it to image/png
    //   // sometimes for jpg, it returns webp...
    //   contentType: response.headers.get('Content-Type') ?? 'image/png',
    //   imageContentBlob: (await response.blob()),
    // }));
    // fallback to content type if extension is not available
    const extension = imageURL.pathname.split('.').pop() ?? 'png';
    const contentType = `image/${extension}`;
    // make content base64 using btoa, because in tiddlywiki it use base64
    // const imageContentBase64 = encodeBase64(imageContent);
    const imageContentBase64 = await toCanvasBase64(node.url);
    const asset: Asset = {
      id: node.url,
      title: `${node.alt || cyrb53(imageContentBase64)}.${extension}`,
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

// from tiddlywiki5 repo
// function encodeBase64(input: string): string {
//   if (typeof input === 'string') input = input.replaceAll('\r\n', '\n');
//   else return input;
//   let output = '';
//   let i = 0;
//   let charCode;

//   for (i; i < input.length; i++) {
//     charCode = input.charCodeAt(i);

//     if (charCode < 128) {
//       output += String.fromCharCode(charCode);
//     } else if ((charCode > 127) && (charCode < 2048)) {
//       output += String.fromCharCode((charCode >> 6) | 192);
//       output += String.fromCharCode((charCode & 63) | 128);
//     } else if ((charCode > 55_295) && (charCode < 57_344) && input.length > i + 1) {
//       // Surrogate pair
//       const hiSurrogate = charCode;
//       const loSurrogate = input.charCodeAt(i + 1);
//       i++; // Skip the low surrogate on the next loop pass
//       const codePoint = (((hiSurrogate - 55_296) << 10) | (loSurrogate - 56_320)) + 65_536;
//       output += String.fromCharCode((codePoint >> 18) | 240);
//       output += String.fromCharCode(((codePoint >> 12) & 63) | 128);
//       output += String.fromCharCode(((codePoint >> 6) & 63) | 128);
//       output += String.fromCharCode((codePoint & 63) | 128);
//     } else {
//       // Not a surrogate pair, or a dangling surrogate without its partner that we'll just encode as-is
//       output += String.fromCharCode((charCode >> 12) | 224);
//       output += String.fromCharCode(((charCode >> 6) & 63) | 128);
//       output += String.fromCharCode((charCode & 63) | 128);
//     }
//   }

//   return output;
// }
