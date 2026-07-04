import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Zen Palette',
    description: 'A configurable Command Palette for Firefox-based browsers.',
    version: '0.1.0',

    action: {
      default_title: 'Zen Palette',
    },

    commands: {
      toggle_palette: {
        suggested_key: {
          default: 'Ctrl+Period',
          linux: 'Ctrl+Period',
        },
        description: 'Toggle Zen Palette',
      },
    },

    permissions: ['tabs', 'activeTab'],
  },
});