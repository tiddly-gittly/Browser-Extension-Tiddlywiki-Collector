# TiddlyWiki Collector: A Browser Extension connect to NodeJS Version of TiddlyWiki or TidGi APP

## Features

- Clip webpage, save as markdown or wikitext to your wiki.
- Bookmark a webpage URI as a tiddler in your wiki. And show it in a browser sidebar.
  - Search & View bookmarked tiddlers in browser (WIP).
- Search your wiki from address bar (WIP).

## Browser Support

| [![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](/) | [![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](/) | [![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](/) | [![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)](/) | [![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png)](/) |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| ✔                                                                                             | ✔ (Beta)                                                                                         | ✔                                                                                       | ✔                                                                                          | ✔                                                                                          |

## Development

Ensure you have

- [Node.js](https://nodejs.org) 16 or later installed
- [pnpm](https://pnpm.io) installed

Then run the following:

- `pnpm install` to install dependencies.
- `pnpm dev` to start the development server.
- `pnpm build` to build an unpacked extension in `dist` `dist-firefox`, and bundle packed zips in `bundle` folder.

- **Load extension in Chrome (Chromium, Manifest V3)**

  - Go to the browser address bar and type `chrome://extensions`
  - Check the `Developer Mode` button to enable it.
  - Click on the `Load Unpacked Extension` button.
  - Select your `dist` folder in the project root.

- **Load extension in Firefox (Partial Manifest V3)**

  - Go to the browser address bar and type [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) (not the [about:addons](about:addons))
  - Click on the `Load Temporary Add-on` list item after click on setting button.
  - Select your `dist-firefox` folder in the project root.

### Other Commands

- `pnpm clean` to remove dist folder. `dev` and `build` commands call this command.
- `pnpm format` to fix code with eslint and prettier.
- `pnpm lint` to call ESLint and Prettier.
- `pnpm test` for testing.

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
