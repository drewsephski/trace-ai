/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeLanguageCode,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  LAUNCH_SUPPORTED_LANGUAGES,
  TRANSLATION_BACKLOG_LANGUAGES,
  isLaunchSupportedLanguage,
} from '@/common/config/i18n';

describe('i18n', () => {
  describe('normalizeLanguageCode', () => {
    it('passes through exact supported tags', () => {
      expect(normalizeLanguageCode('en-US')).toBe('en-US');
      expect(normalizeLanguageCode('de-DE')).toBe('de-DE');
    });

    it('normalizes underscores to hyphens', () => {
      expect(normalizeLanguageCode('de_DE')).toBe('de-DE');
      expect(normalizeLanguageCode('pt_BR')).toBe('pt-BR');
    });

    it('resolves base language codes to their supported region', () => {
      expect(normalizeLanguageCode('ja')).toBe('ja-JP');
      expect(normalizeLanguageCode('ko')).toBe('ko-KR');
      expect(normalizeLanguageCode('tr')).toBe('tr-TR');
      expect(normalizeLanguageCode('ru')).toBe('ru-RU');
      expect(normalizeLanguageCode('uk')).toBe('uk-UA');
      expect(normalizeLanguageCode('pt')).toBe('pt-BR');
      expect(normalizeLanguageCode('de')).toBe('de-DE');
    });

    it('resolves German regional variants to de-DE', () => {
      expect(normalizeLanguageCode('de-AT')).toBe('de-DE');
      expect(normalizeLanguageCode('de-CH')).toBe('de-DE');
    });

    it('falls back to the default language for unsupported codes', () => {
      expect(normalizeLanguageCode('fr')).toBe(DEFAULT_LANGUAGE);
      expect(normalizeLanguageCode('es')).toBe(DEFAULT_LANGUAGE);
      expect(normalizeLanguageCode('zh')).toBe(DEFAULT_LANGUAGE);
      expect(normalizeLanguageCode('zh-CN')).toBe(DEFAULT_LANGUAGE);
      expect(normalizeLanguageCode('')).toBe(DEFAULT_LANGUAGE);
    });
  });

  describe('launch locale scope', () => {
    it('keeps the public launch locale list aligned with runtime-supported locales', () => {
      expect(LAUNCH_SUPPORTED_LANGUAGES).toEqual(SUPPORTED_LANGUAGES);
    });

    it('keeps legacy Chinese locale folders out of launch support until they are complete', () => {
      expect(TRANSLATION_BACKLOG_LANGUAGES).toContain('zh-CN');
      expect(TRANSLATION_BACKLOG_LANGUAGES).toContain('zh-TW');
      expect(isLaunchSupportedLanguage('zh-CN')).toBe(false);
      expect(isLaunchSupportedLanguage('zh-TW')).toBe(false);
      expect(normalizeLanguageCode('zh-CN')).toBe(DEFAULT_LANGUAGE);
    });

    it('identifies configured launch-supported languages', () => {
      expect(isLaunchSupportedLanguage('en-US')).toBe(true);
      expect(isLaunchSupportedLanguage('de-DE')).toBe(true);
      expect(isLaunchSupportedLanguage('fr-FR')).toBe(false);
    });
  });
});
