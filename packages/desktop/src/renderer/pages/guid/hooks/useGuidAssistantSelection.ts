/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { assistantRuntimeKey, type Assistant } from '@/common/types/agent/assistantTypes';
import type { AcpModelInfo } from '../types';
import type { AgentModeOption } from '@/renderer/utils/model/agentTypes';
import {
  buildAgentRuntimeModeState,
  buildAgentRuntimeModelInfo,
  type AgentRuntimeCatalog,
} from '@/renderer/utils/model/agentRuntimeCatalog';
import { useManagedAgentRuntimeCatalog } from '@/renderer/hooks/agent/useManagedAgents';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCustomAgentsLoader } from './useCustomAgentsLoader';

export { buildAgentRuntimeModeState, buildAgentRuntimeModelInfo, type AgentRuntimeCatalog };

const INTERNAL_AION_RUNTIME_KEY = 'aionrs';
const DEFAULT_GUID_RUNTIME_KEY = 'opencode';

export type GuidAssistantSelectionResult = {
  selectedAssistantId: string | null;
  setSelectedAssistantId: (assistantId: string) => void;
  defaultAssistantId: string | null;
  selectedAssistant: Assistant | undefined;
  selectedAssistantBackend: string;
  selectedAssistantAvailable: boolean;
  assistants: Assistant[];
  selectedMode: string;
  setSelectedMode: (mode: React.SetStateAction<string>, options?: { persistPreference?: boolean }) => void;
  selectedAcpModel: string | null;
  setSelectedAcpModel: (model: React.SetStateAction<string | null>, options?: { persistPreference?: boolean }) => void;
  currentAcpCachedModelInfo: AcpModelInfo | null;
  currentAgentModeOptions: AgentModeOption[];
};

export function resolveInitialAssistantModel(models: string[]): string | null {
  if (models.length > 0) {
    return models[0];
  }

  return null;
}

export function buildAssistantModelInfo(models: string[]): AcpModelInfo | null {
  if (models.length > 0) {
    return {
      current_model_id: models[0],
      current_model_label: models[0],
      available_models: models.map((model) => ({ id: model, label: model })),
    } satisfies AcpModelInfo;
  }

  return null;
}

export function resolveAssistantSelectionKey(
  savedKey: string | undefined,
  assistants: Assistant[]
): string | undefined {
  if (!savedKey) return undefined;

  if (savedKey.startsWith('custom:')) {
    const assistantId = savedKey.slice(7);
    return assistants.some((assistant) => assistant.id === assistantId) ? assistantId : undefined;
  }

  if (assistants.some((assistant) => assistant.id === savedKey)) {
    return savedKey;
  }

  return undefined;
}

export function isGuidAssistantVisible(assistant: Assistant): boolean {
  return assistantRuntimeKey(assistant) !== INTERNAL_AION_RUNTIME_KEY;
}

export function pickDefaultAssistantSelectionKey(assistants: Assistant[]): string | null {
  const enabledAssistants = assistants.filter(
    (assistant) => assistant.enabled !== false && isGuidAssistantVisible(assistant)
  );
  const preferred =
    enabledAssistants.find(
      (assistant) => assistant.source === 'generated' && assistantRuntimeKey(assistant) === DEFAULT_GUID_RUNTIME_KEY
    ) ??
    enabledAssistants.find((assistant) => assistantRuntimeKey(assistant) === DEFAULT_GUID_RUNTIME_KEY) ??
    enabledAssistants.find((assistant) => assistant.source === 'generated') ??
    enabledAssistants[0];
  return preferred?.id ?? null;
}

type UseGuidAssistantSelectionOptions = {
  resetAssistant?: boolean;
  preselectAssistantId?: string;
  locationKey?: string;
};

export const useGuidAssistantSelection = ({
  resetAssistant,
  preselectAssistantId,
  locationKey,
}: UseGuidAssistantSelectionOptions): GuidAssistantSelectionResult => {
  const [selectedAssistantIdState, _setSelectedAssistantId] = useState<string | null>(null);
  const [selectedMode, _setSelectedMode] = useState<string>('default');
  const [selectedAcpModel, _setSelectedAcpModel] = useState<string | null>(null);
  const { assistants } = useCustomAgentsLoader();
  const managedAgentRuntimeCatalog = useManagedAgentRuntimeCatalog();
  const guideAssistants = useMemo(() => assistants.filter(isGuidAssistantVisible), [assistants]);

  const setSelectedMode = useCallback(
    (mode: React.SetStateAction<string>, _options?: { persistPreference?: boolean }) => {
      _setSelectedMode((prev) => {
        const nextMode = typeof mode === 'function' ? mode(prev) : mode;
        return nextMode;
      });
    },
    []
  );

  const setSelectedAcpModel = useCallback(
    (modelId: React.SetStateAction<string | null>, _options?: { persistPreference?: boolean }) => {
      _setSelectedAcpModel((prev) => {
        const nextModelId = typeof modelId === 'function' ? modelId(prev) : modelId;
        return nextModelId;
      });
    },
    []
  );

  const setSelectedAssistantId = useCallback(
    (assistantId: string) => {
      const normalizedId = resolveAssistantSelectionKey(assistantId, guideAssistants) ?? assistantId;
      _setSelectedAssistantId(normalizedId);
    },
    [guideAssistants]
  );

  const resetHandledRef = useRef(false);
  const prevLocationKeyRef = useRef(locationKey);
  if (locationKey !== prevLocationKeyRef.current) {
    prevLocationKeyRef.current = locationKey;
    resetHandledRef.current = false;
  }

  useLayoutEffect(() => {
    if (guideAssistants.length === 0) return;
    if (resetHandledRef.current) return;

    if (preselectAssistantId) {
      const resolvedPreselect = resolveAssistantSelectionKey(preselectAssistantId, guideAssistants);
      if (resolvedPreselect) {
        resetHandledRef.current = true;
        _setSelectedAssistantId(resolvedPreselect);
        return;
      }
    }

    if (resetAssistant) {
      resetHandledRef.current = true;
      const fallbackId = pickDefaultAssistantSelectionKey(guideAssistants);
      _setSelectedAssistantId(fallbackId);
    }
  }, [guideAssistants, preselectAssistantId, resetAssistant]);

  useEffect(() => {
    if (guideAssistants.length === 0) return;
    if (resetAssistant) return;
    if (preselectAssistantId && resolveAssistantSelectionKey(preselectAssistantId, guideAssistants)) return;
    if (!selectedAssistantIdState || !guideAssistants.some((assistant) => assistant.id === selectedAssistantIdState)) {
      _setSelectedAssistantId(pickDefaultAssistantSelectionKey(guideAssistants));
    }
  }, [guideAssistants, preselectAssistantId, resetAssistant, selectedAssistantIdState]);

  const selectedAssistant = useMemo(
    () =>
      selectedAssistantIdState
        ? guideAssistants.find((assistant) => assistant.id === selectedAssistantIdState)
        : undefined,
    [guideAssistants, selectedAssistantIdState]
  );
  const selectedAssistantId = selectedAssistant?.id ?? null;
  const selectedAssistantBackend = assistantRuntimeKey(selectedAssistant);
  const selectedAssistantModels = selectedAssistant?.models ?? [];
  const selectedManagedAgentRuntimeCatalog = useMemo(
    () =>
      selectedAssistant?.agent_id
        ? managedAgentRuntimeCatalog.find((agent) => agent.id === selectedAssistant.agent_id)
        : undefined,
    [managedAgentRuntimeCatalog, selectedAssistant?.agent_id]
  );
  const selectedAgentRuntimeModelInfo = useMemo(
    () => buildAgentRuntimeModelInfo(selectedManagedAgentRuntimeCatalog),
    [selectedManagedAgentRuntimeCatalog]
  );
  const selectedAgentRuntimeModeState = useMemo(
    () => buildAgentRuntimeModeState(selectedManagedAgentRuntimeCatalog),
    [selectedManagedAgentRuntimeCatalog]
  );
  const currentAgentModeOptions = selectedAgentRuntimeModeState.options;

  const selectedAssistantAvailable = useMemo(() => {
    return selectedAssistant?.agent_status === 'online';
  }, [selectedAssistant]);

  useEffect(() => {
    const runtimeModelId =
      selectedAgentRuntimeModelInfo?.current_model_id || selectedAgentRuntimeModelInfo?.available_models[0]?.id;
    if (runtimeModelId) {
      _setSelectedAcpModel(runtimeModelId);
      return;
    }

    if (selectedAssistantModels.length > 0) {
      _setSelectedAcpModel(resolveInitialAssistantModel(selectedAssistantModels));
      return;
    }

    _setSelectedAcpModel(resolveInitialAssistantModel([]));
  }, [selectedAssistantModels, selectedAgentRuntimeModelInfo]);

  useEffect(() => {
    const fallbackMode =
      selectedAgentRuntimeModeState.currentMode || selectedAgentRuntimeModeState.options[0]?.value || 'default';
    _setSelectedMode(fallbackMode);
  }, [selectedAgentRuntimeModeState]);

  const currentAcpCachedModelInfo = useMemo(() => {
    if (selectedAgentRuntimeModelInfo) {
      return selectedAgentRuntimeModelInfo;
    }

    return buildAssistantModelInfo(selectedAssistantModels);
  }, [selectedAssistantModels, selectedAgentRuntimeModelInfo]);

  const defaultAssistantId = useMemo(() => pickDefaultAssistantSelectionKey(guideAssistants), [guideAssistants]);

  return {
    selectedAssistantId,
    setSelectedAssistantId,
    defaultAssistantId,
    selectedAssistant,
    selectedAssistantBackend,
    selectedAssistantAvailable,
    assistants: guideAssistants,
    selectedMode,
    setSelectedMode,
    selectedAcpModel,
    setSelectedAcpModel,
    currentAcpCachedModelInfo,
    currentAgentModeOptions,
  };
};
