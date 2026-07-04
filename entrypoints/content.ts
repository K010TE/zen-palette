import { browser } from 'wxt/browser';

type PaletteResult = {
  title: string;
  subtitle: string;
  url: string;
};

let paletteEl: HTMLDivElement | null = null;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function looksLikeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return false;

  if (/^https?:\/\//i.test(trimmed)) return true;

  if (/^localhost(:\d+)?(\/.*)?$/i.test(trimmed)) return true;

  if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/.test(trimmed)) return true;

  if (
    /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/.*)?$/i.test(trimmed) &&
    !trimmed.includes(' ')
  ) {
    return true;
  }

  return false;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^localhost/i.test(trimmed)) {
    return `http://${trimmed}`;
  }

  if (/^(\d{1,3}\.){3}\d{1,3}/.test(trimmed)) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}

function buildSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function getResults(query: string): PaletteResult[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return [
      {
        title: 'Start typing',
        subtitle: 'Search the web or open a URL',
        url: '',
      },
    ];
  }

  const searchResult: PaletteResult = {
    title: `Search "${trimmed}"`,
    subtitle: 'Search the web',
    url: buildSearchUrl(trimmed),
  };

  if (looksLikeUrl(trimmed)) {
    const url = normalizeUrl(trimmed);

    return [
      {
        title: `Open ${trimmed}`,
        subtitle: url,
        url,
      },
      searchResult,
    ];
  }

  return [searchResult];
}

function renderResults(container: HTMLDivElement, results: PaletteResult[]) {
  container.innerHTML = results
    .map((result, index) => {
      const isSelected = index === 0;
      const opacity = result.url ? '1' : '0.55';

      return `
        <div style="
          padding: 12px 14px;
          border-radius: 10px;
          background: ${isSelected ? 'rgba(255,255,255,0.08)' : 'transparent'};
          color: white;
          opacity: ${opacity};
        ">
          <div style="
            font-size: 15px;
            font-weight: 500;
            line-height: 1.3;
          ">
            ${escapeHtml(result.title)}
          </div>

          <div style="
            font-size: 12px;
            opacity: 0.65;
            margin-top: 2px;
            line-height: 1.3;
          ">
            ${escapeHtml(result.subtitle)}
          </div>
        </div>
      `;
    })
    .join('');
}

function destroyPalette() {
  paletteEl?.remove();
  paletteEl = null;
}

async function openResult(url: string) {
  await browser.runtime.sendMessage({
    type: 'ZEN_PALETTE_OPEN',
    url,
  });
}

function createPalette() {
  const el = document.createElement('div');

  el.id = 'zen-palette';

  el.style.position = 'fixed';
  el.style.inset = '0';
  el.style.width = '100vw';
  el.style.height = '100vh';
  el.style.background = 'rgba(0, 0, 0, 0.45)';
  el.style.display = 'flex';
  el.style.alignItems = 'flex-start';
  el.style.justifyContent = 'center';
  el.style.paddingTop = '18vh';
  el.style.zIndex = '2147483647';
  el.style.backdropFilter = 'blur(4px)';

  el.innerHTML = `
    <div style="
      width: min(640px, calc(100vw - 48px));
      background: #111;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 12px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.45);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <input id="zen-palette-input" placeholder="Search or enter URL..." style="
        width: 100%;
        box-sizing: border-box;
        padding: 16px 18px;
        font-size: 18px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.16);
        outline: none;
        background: #1b1b1b;
        color: white;
        margin-bottom: 10px;
      "/>

      <div id="zen-palette-results"></div>
    </div>
  `;

  document.documentElement.appendChild(el);

  const input = el.querySelector('#zen-palette-input') as HTMLInputElement;
  const resultsContainer = el.querySelector('#zen-palette-results') as HTMLDivElement;

  let currentResults = getResults('');

  renderResults(resultsContainer, currentResults);

  setTimeout(() => {
    input.focus();
  }, 0);

  input.addEventListener('input', () => {
    currentResults = getResults(input.value);
    renderResults(resultsContainer, currentResults);
  });

  input.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      const firstResult = currentResults[0];

      if (!firstResult?.url) return;

      await openResult(firstResult.url);
      destroyPalette();
    }

    if (event.key === 'Escape') {
      destroyPalette();
    }
  });

  el.addEventListener('click', (event) => {
    if (event.target === el) {
      destroyPalette();
    }
  });

  return el;
}

function togglePalette() {
  if (paletteEl) {
    destroyPalette();
    return;
  }

  paletteEl = createPalette();
}

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message?.type !== 'TOGGLE_PALETTE') return;

      togglePalette();
    });
  },
});