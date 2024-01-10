# TiddlyWiki Collector: A Browser Extension connect to NodeJS Version of TiddlyWiki or TidGi APP

[中文 Readme](./docs/Readme-zh.md)

## Features

- Clip webpage, save as markdown or wikitext to your wiki.
- Bookmark a webpage URI as a tiddler in your wiki.
  - And show it in a browser sidebar (WIP).
  - Search & View bookmarked tiddlers in browser (WIP).
- Search your wiki from address bar (WIP).

## Usage

1. Add your Nodejs TiddlyWiki's WebServer API URL to the "Options" of this extension.
2. Click on extension icon to open popup of this extension. You can see some buttons to save the page to your wiki.

## Browser Support

| [![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](https://chromewebstore.google.com/u/2/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo) | [![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](https://addons.mozilla.org/firefox/addon/tiddlywiki-collector/) | [![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](https://chromewebstore.google.com/u/2/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo) | [![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)](https://chromewebstore.google.com/u/2/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo) | [![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png)](https://chromewebstore.google.com/u/2/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo) |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Install](https://chrome.google.com/webstore/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo)                                                                                     | [Install](https://addons.mozilla.org/firefox/addon/tiddlywiki-collector/)                                                                                     | [Install](https://chrome.google.com/webstore/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo)                                                                               | [Install](https://chrome.google.com/webstore/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo)                                                                                  | [Install](https://chrome.google.com/webstore/detail/tiddlywiki-collector/mgblpgmmbdbbndgfdjhjcfbkpoanafgo)                                                                                  |

### Screenshots

The popup when you Click on extension icon:

![docs/images/screenshot-popup-zh.png](docs/images/screenshot-popup-zh.png)

With English localization:

![docs/images/screenshot-popup-en.png](docs/images/screenshot-popup-en.png)

## Development

Ensure you have

- [Node.js](https://nodejs.org) 16 or later installed
- [pnpm](https://pnpm.io) installed

Then run the following:

- `pnpm install` to install dependencies.
- `pnpm dev` to start the development server.
- `pnpm build` to build an unpacked extension in `dist` `dist-firefox`, and bundle packed zips in `bundle` folder.

### Load dev extension in Chrome (Chromium, Manifest V3)**

1. Go to the browser address bar and type `chrome://extensions`
1. Check the `Developer Mode` button to enable it.
1. Click on the `Load Unpacked Extension` button.
1. Select your `dist` folder in the project root.

### Load dev extension in Firefox (Partial Manifest V3)**

1. Go to the browser address bar and type [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) (not the [about:addons](about:addons))
1. Click on the `Load Temporary Add-on` list item after click on setting button.
1. Select your `dist-firefox` folder in the project root.
1. [Debug popup in firefox](https://firefox-source-docs.mozilla.org/devtools-user/browser_toolbox/index.html)

### Other Commands

- `pnpm clean` to remove dist folder. `dev` and `build` commands call this command.
- `pnpm format` to fix code with eslint and prettier.
- `pnpm lint` to call ESLint and Prettier.
- `pnpm test` for testing.

### Upload to Store

1. tag a git commit with `vx.x.x` or `vx.x.x-xxx`
1. Github Action will auto release new zips to https://github.com/tiddly-gittly/Browser-Extension-Tiddlywiki-Collector/releases
1. Manually upload zip to stores

- Firefox: https://addons.mozilla.org/zh-CN/developers/addons
- Chrome: https://chrome.google.com/u/2/webstore/devconsole

### zustand

You can use zustand (zustand-toolkit) as state manager between popup, background, content and custom pages. Read the documentation for more.

#### [@eduardoac-skimlinks/webext-zustand](https://github.com/eduardoacskimlinks/webext-zustand)

### Bundling

#### [@crxjs/vite-plugin](https://github.com/crxjs/chrome-extension-tools)

> **Note** This plugin powers the development side of this starter.
>
> docs: https://crxjs.dev/vite-plugin
>
> Special thanks to [@jacksteamdev](https://github.com/jacksteamdev) and contributors for this amazing plugin.

## Contributing

This repository is following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

## Privacy

This Extension is local-first, don't collect any user data.
