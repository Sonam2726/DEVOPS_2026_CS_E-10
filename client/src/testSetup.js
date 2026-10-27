import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  delete HTMLElement.prototype.scrollIntoView;
});
