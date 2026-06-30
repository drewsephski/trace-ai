/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import type { WebPreferences } from 'electron';
import { pathToFileURL } from 'url';
import {
  createMainWindowNavigationPolicy,
  hardenWebviewPreferences,
  isAllowedMainWindowNavigation,
  isAllowedWebviewSourceUrl,
  isExternalHttpUrl,
} from '@/process/startup/windowSecurity';

describe('main-window navigation security', () => {
  const fallbackFile = '/app/out/renderer/index.html';
  const policy = createMainWindowNavigationPolicy({
    fallbackFile,
    rendererUrl: 'http://localhost:5173/index.html',
  });

  it('allows the configured renderer origins and packaged entry file', () => {
    expect(isAllowedMainWindowNavigation('http://localhost:5173/settings', policy)).toBe(true);
    expect(isAllowedMainWindowNavigation(`${pathToFileURL(fallbackFile).href}#/settings`, policy)).toBe(true);
  });

  it('blocks unconfigured origins and arbitrary local files', () => {
    expect(isAllowedMainWindowNavigation('https://example.com/phish', policy)).toBe(false);
    expect(isAllowedMainWindowNavigation(pathToFileURL('/app/out/renderer/other.html').href, policy)).toBe(false);
  });
});

describe('external URL detection', () => {
  it('only treats HTTP(S) URLs as safe to hand to the OS browser', () => {
    expect(isExternalHttpUrl('https://example.com')).toBe(true);
    expect(isExternalHttpUrl('http://example.com')).toBe(true);
    expect(isExternalHttpUrl('file:///etc/passwd')).toBe(false);
    expect(isExternalHttpUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('webview source security', () => {
  it('allows expected preview and browser source protocols', () => {
    expect(isAllowedWebviewSourceUrl('https://example.com')).toBe(true);
    expect(isAllowedWebviewSourceUrl('http://127.0.0.1:18888/watch')).toBe(true);
    expect(isAllowedWebviewSourceUrl('file:///workspace/report.pdf')).toBe(true);
    expect(isAllowedWebviewSourceUrl('data:text/html,%3Cmain%3EPreview%3C%2Fmain%3E')).toBe(true);
    expect(isAllowedWebviewSourceUrl('about:blank')).toBe(true);
  });

  it('blocks script-like and privileged webview sources', () => {
    expect(isAllowedWebviewSourceUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedWebviewSourceUrl('data:text/javascript,alert(1)')).toBe(false);
    expect(isAllowedWebviewSourceUrl('devtools://devtools/bundled/inspector.html')).toBe(false);
  });
});

describe('webview preference hardening', () => {
  it('overrides dangerous guest preferences', () => {
    const preferences: WebPreferences = {
      allowRunningInsecureContent: true,
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      preload: '/tmp/untrusted-preload.js',
      sandbox: false,
      webSecurity: false,
    };

    hardenWebviewPreferences(preferences);

    expect(preferences).toMatchObject({
      allowRunningInsecureContent: false,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      sandbox: true,
      webSecurity: true,
    });
    expect(preferences.preload).toBeUndefined();
  });
});
