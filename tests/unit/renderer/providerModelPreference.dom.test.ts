/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { STORAGE_KEYS } from '@/common/config/storageKeys';
import type { IProvider, TProviderWithModel } from '@/common/config/storage';
import {
  readLastProviderModelPreference,
  resolveLastProviderForPreferredModel,
  resolveProviderModelPreference,
  writeLastProviderModelPreference,
} from '@/renderer/pages/conversation/utils/providerModelPreference';
import { afterEach, describe, expect, it, vi } from 'vitest';

const buildProvider = (id: string, models: string[]): IProvider =>
  ({
    id,
    name: id,
    platform: 'openai-compatible',
    base_url: '',
    api_key: '',
    models,
  }) as IProvider;

describe('provider model preference', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('persists the provider and model selected by the user', () => {
    writeLastProviderModelPreference({
      ...buildProvider('provider-b', ['gpt-4.1']),
      use_model: 'gpt-4.1',
    } as TProviderWithModel);

    expect(readLastProviderModelPreference()).toEqual({
      providerId: 'provider-b',
      modelName: 'gpt-4.1',
    });
  });

  it('resolves the saved provider/model only when it is still available', () => {
    const providers = [buildProvider('provider-a', ['same-model']), buildProvider('provider-b', ['same-model'])];

    const resolved = resolveProviderModelPreference({
      providers,
      preference: { providerId: 'provider-b', modelName: 'same-model' },
      getAvailableModels: (provider) => provider.models ?? [],
    });

    expect(resolved?.id).toBe('provider-b');
    expect(resolved?.use_model).toBe('same-model');

    expect(
      resolveProviderModelPreference({
        providers,
        preference: { providerId: 'provider-b', modelName: 'disabled-model' },
        getAvailableModels: () => ['same-model'],
      })
    ).toBeUndefined();
  });

  it('keeps the saved provider when resolving a preferred model for a new chat', () => {
    const providers = [
      buildProvider('provider-a', ['gpt-4.1']),
      buildProvider('provider-b', ['last-model', 'gpt-4.1']),
    ];

    const resolved = resolveLastProviderForPreferredModel({
      providers,
      preference: { providerId: 'provider-b', modelName: 'last-model' },
      preferredModelName: 'gpt-4.1',
      getAvailableModels: (provider) => provider.models ?? [],
    });

    expect(resolved?.id).toBe('provider-b');
    expect(resolved?.use_model).toBe('gpt-4.1');
  });

  it('falls back to the saved provider/model when the preferred model is unavailable there', () => {
    const providers = [buildProvider('provider-a', ['gpt-4.1']), buildProvider('provider-b', ['last-model'])];

    const resolved = resolveLastProviderForPreferredModel({
      providers,
      preference: { providerId: 'provider-b', modelName: 'last-model' },
      preferredModelName: 'gpt-4.1',
      getAvailableModels: (provider) => provider.models ?? [],
    });

    expect(resolved?.id).toBe('provider-b');
    expect(resolved?.use_model).toBe('last-model');
  });

  it('ignores corrupt stored preference data', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem(STORAGE_KEYS.LAST_CHAT_PROVIDER_MODEL, '{not json');

    expect(readLastProviderModelPreference()).toBeUndefined();
    expect(errorSpy).toHaveBeenCalledOnce();
  });
});
