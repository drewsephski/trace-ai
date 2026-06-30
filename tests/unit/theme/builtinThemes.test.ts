import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BUILTIN_THEMES } from '@/renderer/theme/builtinThemes';

const brandThemes = [
  { id: 'openai-codex', file: 'openai-codex.css' },
  { id: 'claude-console', file: 'claude-console.css' },
  { id: 'opencode-terminal', file: 'opencode-terminal.css' },
  { id: 'gemini-spectrum', file: 'gemini-spectrum.css' },
  { id: 'cursor-midnight', file: 'cursor-midnight.css' },
  { id: 'copilot-workbench', file: 'copilot-workbench.css' },
];

const premiumThemes = [
  { id: 'aurora-glass', file: 'aurora-glass.css' },
  { id: 'prism-daylight', file: 'prism-daylight.css' },
  { id: 'graphite-studio', file: 'graphite-studio.css' },
  { id: 'neon-circuit', file: 'neon-circuit.css' },
  { id: 'porcelain-studio', file: 'porcelain-studio.css' },
  { id: 'zinc-canvas', file: 'zinc-canvas.css' },
  { id: 'stone-taupe', file: 'stone-taupe.css' },
];

const legacyThemeIds = [
  'misaka-mikoto-theme',
  'hello-kitty',
  'retro-windows',
  'retroma-y2k-jp-v42-pure',
  'retroma-obsidian-book',
  'retroma-obsidian-book-slate',
  'retroma-obsidian-book-night',
  'retroma-nocturne-parchment',
  'discourse-horizon',
  'glittering-input-field',
];

const brandPresetDir = path.resolve(
  process.cwd(),
  'packages/desktop/src/renderer/pages/settings/AppearanceSettings/brandPresets'
);

const premiumPresetDir = path.resolve(
  process.cwd(),
  'packages/desktop/src/renderer/pages/settings/AppearanceSettings/premiumPresets'
);

const cssThemeSettingsSourceFile = path.resolve(
  process.cwd(),
  'packages/desktop/src/renderer/pages/settings/AppearanceSettings/CssThemeSettings.tsx'
);

describe('BUILTIN_THEMES generated presets', () => {
  it('registers each generated background theme as a built-in preset', () => {
    const themesById = new Map(BUILTIN_THEMES.map((theme) => [theme.id, theme]));

    for (const { id } of [...brandThemes, ...premiumThemes]) {
      const theme = themesById.get(id);
      expect(theme?.builtin).toBe(true);
      expect(theme?.appearance).toMatch(/^(light|dark)$/);
    }
  });

  it('does not duplicate built-in theme ids', () => {
    const ids = BUILTIN_THEMES.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not register the legacy decorative background themes', () => {
    const ids = new Set(BUILTIN_THEMES.map((theme) => theme.id));

    for (const id of legacyThemeIds) {
      expect(ids.has(id)).toBe(false);
    }
  });

  it('keeps every generated source css file wired for app and gallery backgrounds', () => {
    const themeFiles = [
      ...brandThemes.map(({ file }) => path.join(brandPresetDir, file)),
      ...premiumThemes.map(({ file }) => path.join(premiumPresetDir, file)),
    ];

    for (const file of themeFiles) {
      const css = fs.readFileSync(file, 'utf8');
      expect(css).toContain('--premium-backdrop');
      expect(css).toContain('--theme-preview-bg');
      expect(css).toContain('.app-shell');
    }
  });

  it('derives settings gallery preview palettes from each theme appearance', () => {
    const source = fs.readFileSync(cssThemeSettingsSourceFile, 'utf8');

    expect(source).toContain("extractThemePreviewPalette(cssTheme.css || '', getThemePreviewMode(cssTheme))");
    expect(source).toContain('fallbackThemePreviewPaletteByMode[getThemePreviewMode(theme)]');
    expect(source).not.toContain("extractThemePreviewPalette(cssTheme.css || '', currentTheme");
    expect(source).not.toContain('fallbackThemePreviewPaletteByMode[currentTheme');
  });
});
