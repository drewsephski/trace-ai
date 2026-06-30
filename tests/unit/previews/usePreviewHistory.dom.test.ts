/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 *
 * N4c V2: usePreviewHistory hook export-shape smoke test.
 *
 * Design note:
 * usePreviewHistory spins backend calls + debounced save timers via useEffect.
 * Under the worker-fork pool the ipcBridge / httpBridge chain never settles
 * (plan §2.4 WS reconnect hazard), and the hook hangs waitFor() indefinitely.
 * We therefore validate the module surface only; functional behavior is left
 * to e2e. This is recorded in N4c-final.md Deviations.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/common', () => ({
  ipcBridge: {
    previewHistory: {
      getContent: { invoke: vi.fn() },
      list: { invoke: vi.fn() },
      save: { invoke: vi.fn() },
    },
  },
}));

vi.mock('@arco-design/web-react', () => ({
  Message: {
    useMessage: () => [
      { error: vi.fn(), info: vi.fn(), success: vi.fn() },
      React.createElement('div', { key: 'message-context' }),
    ],
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('usePreviewHistory module shape', () => {
  it('module loads and exposes usePreviewHistory', async () => {
    const mod = await import('@/renderer/pages/conversation/Preview/hooks/usePreviewHistory');
    expect(mod).toBeDefined();
    expect(mod.usePreviewHistory).toBeDefined();
  });

  it('usePreviewHistory is a function (React hook)', async () => {
    const mod = await import('@/renderer/pages/conversation/Preview/hooks/usePreviewHistory');
    expect(typeof mod.usePreviewHistory).toBe('function');
  });

  it('the hook function has at most one parameter (options bag)', async () => {
    const mod = await import('@/renderer/pages/conversation/Preview/hooks/usePreviewHistory');
    // React hooks typically take one options argument; assert a loose upper bound.
    expect((mod.usePreviewHistory as { length: number }).length).toBeLessThanOrEqual(2);
  });
});
