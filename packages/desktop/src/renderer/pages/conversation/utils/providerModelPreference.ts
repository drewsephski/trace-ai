/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { STORAGE_KEYS } from '@/common/config/storageKeys';
import type { IProvider, TProviderWithModel } from '@/common/config/storage';

export type ProviderModelPreference = {
  providerId: string;
  modelName: string;
};

type ProviderModelResolverOptions = {
  providers: IProvider[];
  preference: ProviderModelPreference | undefined;
  getAvailableModels: (provider: IProvider) => string[];
};

type ProviderPreferenceModelResolverOptions = ProviderModelResolverOptions & {
  preferredModelName: string | undefined;
};

const getLocalStorage = (): Storage | undefined => {
  try {
    return typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage;
  } catch {
    return undefined;
  }
};

const isProviderModelPreference = (value: unknown): value is ProviderModelPreference => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ProviderModelPreference>;
  return typeof candidate.providerId === 'string' && typeof candidate.modelName === 'string';
};

export const readLastProviderModelPreference = (): ProviderModelPreference | undefined => {
  const storage = getLocalStorage();
  if (!storage) return undefined;

  try {
    const raw = storage.getItem(STORAGE_KEYS.LAST_CHAT_PROVIDER_MODEL);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as unknown;
    return isProviderModelPreference(parsed) ? parsed : undefined;
  } catch (error) {
    console.error('Failed to read last provider model preference:', error);
    return undefined;
  }
};

export const writeLastProviderModelPreference = (model: TProviderWithModel): void => {
  const storage = getLocalStorage();
  if (!storage || !model.id || !model.use_model) return;

  try {
    storage.setItem(
      STORAGE_KEYS.LAST_CHAT_PROVIDER_MODEL,
      JSON.stringify({
        providerId: model.id,
        modelName: model.use_model,
      } satisfies ProviderModelPreference)
    );
  } catch (error) {
    console.error('Failed to save last provider model preference:', error);
  }
};

export const resolveProviderModelPreference = ({
  providers,
  preference,
  getAvailableModels,
}: ProviderModelResolverOptions): TProviderWithModel | undefined => {
  if (!preference) return undefined;

  const provider = providers.find((candidate) => candidate.id === preference.providerId);
  if (!provider) return undefined;

  const availableModels = getAvailableModels(provider);
  if (!availableModels.includes(preference.modelName)) return undefined;

  return {
    ...(provider as unknown as TProviderWithModel),
    use_model: preference.modelName,
  };
};

export const resolveLastProviderForPreferredModel = ({
  providers,
  preference,
  getAvailableModels,
  preferredModelName,
}: ProviderPreferenceModelResolverOptions): TProviderWithModel | undefined => {
  if (!preference) return undefined;

  const provider = providers.find((candidate) => candidate.id === preference.providerId);
  if (!provider) return undefined;

  const availableModels = getAvailableModels(provider);
  const resolvedModelName =
    preferredModelName && availableModels.includes(preferredModelName)
      ? preferredModelName
      : availableModels.includes(preference.modelName)
        ? preference.modelName
        : undefined;

  if (!resolvedModelName) return undefined;

  return {
    ...(provider as unknown as TProviderWithModel),
    use_model: resolvedModelName,
  };
};
