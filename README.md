# Zen Palette

> Keyboard-first command palette for Chromium-based browsers.

Zen Palette is an open-source WebExtension inspired by the command palette experience of Zen Browser.

It opens a clean centered palette with a shortcut. Type a search term or URL, press Enter, and Zen Palette opens the result in a new tab.

## Features

- Keyboard-triggered command palette
- Web search
- URL detection
- Minimal centered overlay
- Opens results in a new tab
- No autocomplete/cache in the palette input

## Browser Support

Zen Palette is currently focused on Chromium-based browsers:

- Chromium
- Google Chrome
- Brave
- Microsoft Edge
- Vivaldi
- Opera

Firefox/Floorp support may be explored later, but it is not the current target.

## Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build for Chromium:

```bash
npm run build -- --browser chrome --mv3
```

Load the generated extension from:

```text
.output/chrome-mv3
```

## Tech Stack

- TypeScript
- WXT
- WebExtensions API
- Vite

## Status

Early prototype.

## License

MIT
