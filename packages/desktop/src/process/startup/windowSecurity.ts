/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  BrowserWindow,
  Event as ElectronEvent,
  HandlerDetails,
  WebContents,
  WebPreferences,
  WindowOpenHandlerResponse,
} from 'electron';
import { pathToFileURL } from 'url';

type OpenExternalUrl = (url: string) => Promise<void>;

export type MainWindowNavigationPolicy = {
  allowedOrigins: ReadonlySet<string>;
  allowedFileUrls: ReadonlySet<string>;
};

export type CreateMainWindowNavigationPolicyOptions = {
  fallbackFile: string;
  rendererUrl?: string;
};

export type AttachWindowSecurityOptions = {
  openExternalUrl: OpenExternalUrl;
  policy: MainWindowNavigationPolicy;
};

const EXTERNAL_PROTOCOLS = new Set(['http:', 'https:']);
const WEBVIEW_PROTOCOLS = new Set(['http:', 'https:', 'file:']);
const SAFE_DATA_URL_PATTERN = /^data:(?:text\/html|text\/plain|application\/pdf)(?:[;,]|$)/i;

export const createMainWindowNavigationPolicy = ({
  fallbackFile,
  rendererUrl,
}: CreateMainWindowNavigationPolicyOptions): MainWindowNavigationPolicy => {
  const allowedOrigins = new Set<string>();
  const allowedFileUrls = new Set<string>([pathToFileURL(fallbackFile).href]);

  if (rendererUrl) {
    try {
      allowedOrigins.add(new URL(rendererUrl).origin);
    } catch {
      // Invalid development renderer URLs are handled by loadURL fallback.
    }
  }

  return { allowedOrigins, allowedFileUrls };
};

export const isExternalHttpUrl = (targetUrl: string): boolean => {
  try {
    return EXTERNAL_PROTOCOLS.has(new URL(targetUrl).protocol);
  } catch {
    return false;
  }
};

export const isAllowedMainWindowNavigation = (targetUrl: string, policy: MainWindowNavigationPolicy): boolean => {
  try {
    const parsed = new URL(targetUrl);

    if (parsed.protocol === 'file:') {
      parsed.hash = '';
      parsed.search = '';
      return policy.allowedFileUrls.has(parsed.href);
    }

    return policy.allowedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
};

export const isAllowedWebviewSourceUrl = (targetUrl: string): boolean => {
  try {
    const parsed = new URL(targetUrl);
    if (WEBVIEW_PROTOCOLS.has(parsed.protocol)) return true;
    if (parsed.protocol === 'about:') return parsed.href === 'about:blank';
    if (parsed.protocol === 'data:') return SAFE_DATA_URL_PATTERN.test(targetUrl);
    return false;
  } catch {
    return false;
  }
};

export const hardenWebviewPreferences = (preferences: WebPreferences): void => {
  preferences.nodeIntegration = false;
  preferences.nodeIntegrationInSubFrames = false;
  preferences.contextIsolation = true;
  preferences.sandbox = true;
  preferences.allowRunningInsecureContent = false;
  preferences.webSecurity = true;

  delete preferences.preload;
};

const denyWindowOpen = (
  details: HandlerDetails,
  openExternalUrl: OpenExternalUrl,
  context: string
): WindowOpenHandlerResponse => {
  if (isExternalHttpUrl(details.url)) {
    openExternalUrl(details.url).catch((error: unknown) => {
      console.warn(`[Trace] Failed to open ${context} popup externally:`, error);
    });
  } else {
    console.warn(`[Trace] Blocked ${context} popup URL: ${details.url}`);
  }

  return { action: 'deny' };
};

const guardWebviewContents = (contents: WebContents, openExternalUrl: OpenExternalUrl): void => {
  contents.setWindowOpenHandler((details) => denyWindowOpen(details, openExternalUrl, 'webview'));

  contents.on('will-navigate', (event, targetUrl) => {
    if (isAllowedWebviewSourceUrl(targetUrl)) return;
    event.preventDefault();
    console.warn(`[Trace] Blocked webview navigation URL: ${targetUrl}`);
  });
};

export const attachMainWindowSecurity = (mainWindow: BrowserWindow, options: AttachWindowSecurityOptions): void => {
  mainWindow.webContents.setWindowOpenHandler((details) =>
    denyWindowOpen(details, options.openExternalUrl, 'main-window')
  );

  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (isAllowedMainWindowNavigation(targetUrl, options.policy)) return;

    event.preventDefault();
    if (isExternalHttpUrl(targetUrl)) {
      options.openExternalUrl(targetUrl).catch((error: unknown) => {
        console.warn('[Trace] Failed to open blocked navigation externally:', error);
      });
      return;
    }

    console.warn(`[Trace] Blocked main-window navigation URL: ${targetUrl}`);
  });

  mainWindow.webContents.on(
    'will-attach-webview',
    (event: ElectronEvent, preferences: WebPreferences, params: Record<string, string>) => {
      if (!isAllowedWebviewSourceUrl(params.src ?? '')) {
        event.preventDefault();
        console.warn(`[Trace] Blocked webview attach URL: ${params.src ?? ''}`);
        return;
      }

      hardenWebviewPreferences(preferences);
      params.allowpopups = 'false';
    }
  );
};

export const attachWebContentsSecurity = (contents: WebContents, openExternalUrl: OpenExternalUrl): void => {
  if (contents.getType() === 'webview') {
    guardWebviewContents(contents, openExternalUrl);
  }
};
