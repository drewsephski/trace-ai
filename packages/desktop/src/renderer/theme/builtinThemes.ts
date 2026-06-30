/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Theme } from '@/common/theme/types';
import { LIGHT_THEME_ID, DARK_THEME_ID } from '@/common/theme/constants';

import { defaultThemeCover } from '@renderer/pages/settings/AppearanceSettings/themeCovers';

import auroraGlassCss from '@renderer/pages/settings/AppearanceSettings/premiumPresets/aurora-glass.css?raw';
import prismDaylightCss from '@renderer/pages/settings/AppearanceSettings/premiumPresets/prism-daylight.css?raw';
import graphiteStudioCss from '@renderer/pages/settings/AppearanceSettings/premiumPresets/graphite-studio.css?raw';
import neonCircuitCss from '@renderer/pages/settings/AppearanceSettings/premiumPresets/neon-circuit.css?raw';
import porcelainStudioCss from '@renderer/pages/settings/AppearanceSettings/premiumPresets/porcelain-studio.css?raw';
import zincCanvasCss from '@renderer/pages/settings/AppearanceSettings/premiumPresets/zinc-canvas.css?raw';
import stoneTaupeCss from '@renderer/pages/settings/AppearanceSettings/premiumPresets/stone-taupe.css?raw';
import openaiCodexCss from '@renderer/pages/settings/AppearanceSettings/brandPresets/openai-codex.css?raw';
import claudeConsoleCss from '@renderer/pages/settings/AppearanceSettings/brandPresets/claude-console.css?raw';
import opencodeTerminalCss from '@renderer/pages/settings/AppearanceSettings/brandPresets/opencode-terminal.css?raw';
import geminiSpectrumCss from '@renderer/pages/settings/AppearanceSettings/brandPresets/gemini-spectrum.css?raw';
import cursorMidnightCss from '@renderer/pages/settings/AppearanceSettings/brandPresets/cursor-midnight.css?raw';
import copilotWorkbenchCss from '@renderer/pages/settings/AppearanceSettings/brandPresets/copilot-workbench.css?raw';

const T0 = 0;

const decorative = (id: string, name: string, appearance: Theme['appearance'], css: string, cover?: string): Theme => ({
  id,
  name,
  appearance,
  css,
  cover,
  builtin: true,
  created_at: T0,
  updated_at: T0,
});

export const BUILTIN_THEMES: Theme[] = [
  {
    id: LIGHT_THEME_ID,
    name: 'Light',
    appearance: 'light',
    cover: defaultThemeCover,
    builtin: true,
    created_at: T0,
    updated_at: T0,
  },
  { id: DARK_THEME_ID, name: 'Dark', appearance: 'dark', builtin: true, created_at: T0, updated_at: T0 },
  decorative('openai-codex', 'OpenAI Codex', 'dark', openaiCodexCss),
  decorative('claude-console', 'Claude Console', 'dark', claudeConsoleCss),
  decorative('opencode-terminal', 'OpenCode Terminal', 'dark', opencodeTerminalCss),
  decorative('gemini-spectrum', 'Gemini Spectrum', 'dark', geminiSpectrumCss),
  decorative('cursor-midnight', 'Cursor Midnight', 'dark', cursorMidnightCss),
  decorative('copilot-workbench', 'Copilot Workbench', 'dark', copilotWorkbenchCss),
  decorative('aurora-glass', 'Aurora Glass', 'dark', auroraGlassCss),
  decorative('prism-daylight', 'Prism Daylight', 'light', prismDaylightCss),
  decorative('graphite-studio', 'Graphite Studio', 'dark', graphiteStudioCss),
  decorative('neon-circuit', 'Neon Circuit', 'dark', neonCircuitCss),
  decorative('porcelain-studio', 'Porcelain Studio', 'light', porcelainStudioCss),
  decorative('zinc-canvas', 'Zinc Canvas', 'dark', zincCanvasCss),
  decorative('stone-taupe', 'Stone Taupe', 'dark', stoneTaupeCss),
];

export const BUILTIN_THEME_IDS = new Set(BUILTIN_THEMES.map((t) => t.id));
