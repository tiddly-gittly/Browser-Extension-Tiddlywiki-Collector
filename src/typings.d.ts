/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="chrome"/>
/// <reference types="vite/client" />

declare module 'remark-gfm' {
  import { Plugin } from 'unified';

  const remarkGfm: Plugin;

  export = remarkGfm;
}
