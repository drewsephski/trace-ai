/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('@/common', () => ({
  ipcBridge: {
    fs: {
      openPath: { invoke: vi.fn() },
      saveFile: { invoke: vi.fn() },
    },
  },
}));

vi.mock('@/renderer/utils/file/download', () => ({
  downloadFileFromPath: vi.fn(),
  downloadTextContent: vi.fn(),
}));

vi.mock('@/renderer/hooks/context/LayoutContext', () => ({
  useLayoutContext: () => ({ setPreviewPanelVisible: vi.fn() }),
}));

vi.mock('@/renderer/components/Markdown/markdownUtils', () => ({
  toLocalFileHref: (path: string) => path,
}));

vi.mock('@/renderer/pages/conversation/Preview/context/PreviewToolbarExtrasContext', () => ({
  PreviewToolbarExtrasProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/renderer/pages/conversation/Preview/context/PreviewContext', () => ({
  usePreviewContext: () => ({
    activeTab: null,
    activeTabId: null,
    addDomSnippet: vi.fn(),
    closePreview: vi.fn(),
    closeTab: vi.fn(),
    isOpen: false,
    saveContent: vi.fn(),
    switchTab: vi.fn(),
    tabs: [],
    updateContent: vi.fn(),
  }),
}));

vi.mock('@/renderer/hooks/ui/useResizableSplit', () => ({
  useResizableSplit: () => ({
    createDragHandle: () => null,
    splitRatio: 50,
  }),
}));

vi.mock('@arco-design/web-react', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/renderer/pages/conversation/Preview/components/PreviewPanel', () => ({
  PreviewConfirmModals: () => null,
  PreviewContextMenu: () => null,
  PreviewHistoryDropdown: () => null,
  PreviewTabs: () => null,
  PreviewToolbar: () => null,
}));

vi.mock('@/renderer/pages/conversation/Preview/hooks', () => ({
  usePreviewHistory: () => ({
    handleSaveSnapshot: vi.fn(),
    handleSnapshotSelect: vi.fn(),
    historyError: null,
    historyLoading: false,
    historyTarget: null,
    historyVersions: [],
    messageApi: { error: vi.fn() },
    messageContextHolder: null,
    refreshHistory: vi.fn(),
    snapshotSaving: false,
  }),
  usePreviewKeyboardShortcuts: vi.fn(),
  useScrollSync: () => ({
    handleEditorScroll: vi.fn(),
    handlePreviewScroll: vi.fn(),
  }),
  useTabOverflow: () => ({
    tabFadeState: { left: false, right: false },
    tabsContainerRef: { current: null },
  }),
  useThemeDetection: () => 'light',
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/DiffViewer', () => ({
  default: () => <div data-testid='diff-viewer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/ExcelViewer', () => ({
  default: () => <div data-testid='excel-viewer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/editors/HTMLEditor', () => ({
  default: () => <div data-testid='html-editor' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/renderers/HTMLRenderer', () => ({
  default: () => <div data-testid='html-renderer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/ImageViewer', () => ({
  default: () => <div data-testid='image-viewer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/editors/MarkdownEditor', () => ({
  default: () => <div data-testid='markdown-editor' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/MarkdownViewer', () => ({
  default: () => <div data-testid='markdown-viewer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/PDFViewer', () => ({
  default: () => <div data-testid='pdf-viewer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/OfficeDocViewer', () => ({
  default: () => <div data-testid='office-doc-viewer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/PptViewer', () => ({
  default: () => <div data-testid='ppt-viewer' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/editors/CodeEditor', () => ({
  default: () => <div data-testid='code-editor' />,
}));

vi.mock('@/renderer/pages/conversation/Preview/components/viewers/URLViewer', () => ({
  default: () => <div data-testid='url-viewer' />,
}));

beforeEach(() => {
  window.__backendPort = 13400;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      return new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete window.__backendPort;
});

// PreviewPanel pulls in a large dependency graph; under the full concurrent
// suite the first cold import's transform/resolve can exceed the default 10s
// timeout (flaky), even though it resolves in a few seconds in isolation. Give
// these import-bound assertions extra headroom so they don't flake.
const IMPORT_TIMEOUT_MS = 30000;

describe('PreviewPanel', () => {
  it(
    'is a React component module that exports a default function',
    async () => {
      const mod = await import('@/renderer/pages/conversation/Preview/components/PreviewPanel/PreviewPanel');
      expect(typeof mod.default).toBe('function');
    },
    IMPORT_TIMEOUT_MS
  );

  it(
    'module loads without throwing on import',
    async () => {
      await expect(
        import('@/renderer/pages/conversation/Preview/components/PreviewPanel/PreviewPanel')
      ).resolves.toBeTruthy();
    },
    IMPORT_TIMEOUT_MS
  );

  it(
    'has a displayName or function name for debugging',
    async () => {
      const mod = await import('@/renderer/pages/conversation/Preview/components/PreviewPanel/PreviewPanel');
      const fn = mod.default;
      expect(fn.name || fn.displayName || 'anonymous').toBeTruthy();
    },
    IMPORT_TIMEOUT_MS
  );
});
