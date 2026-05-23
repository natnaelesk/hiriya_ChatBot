import '@testing-library/jest-dom/vitest';

if (typeof globalThis.matchMedia !== 'function') {
  globalThis.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom doesn't ship scrollTo on Element by default.
if (typeof window !== 'undefined' && typeof window.HTMLElement.prototype.scrollTo !== 'function') {
  window.HTMLElement.prototype.scrollTo = () => {};
}
