/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TChatConversation } from '@/common/config/storage';
import ConversationRow from '@/renderer/pages/conversation/GroupedHistory/ConversationRow';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/renderer/hooks/agent/usePresetAssistantInfo', () => ({
  usePresetAssistantInfo: () => ({ info: undefined }),
}));

vi.mock('@/renderer/pages/cron', () => ({
  CronJobIndicator: ({ status }: { status: string }) => <span data-testid={`cron-${status}`} />,
}));

vi.mock('@/renderer/utils/model/agentLogo', () => ({
  resolveAgentLogo: () => null,
  useAgentLogos: () => ({}),
}));

vi.mock('@/renderer/utils/ui/siderTooltip', () => ({
  cleanupSiderTooltips: vi.fn(),
  getSiderTooltipProps: () => ({ disabled: true }),
}));

const conversation: TChatConversation = {
  created_at: 1,
  modified_at: 1,
  name: 'Active chat',
  id: 'conversation-1',
  type: 'acp',
  extra: {
    backend: 'aionrs',
  },
  model: {
    id: 'provider-1',
    platform: 'openai',
    name: 'Provider',
    base_url: 'https://example.test',
    api_key: '',
    use_model: 'model-1',
  },
};

function renderConversationRow(overrides: Partial<React.ComponentProps<typeof ConversationRow>> = {}) {
  return render(
    <ConversationRow
      conversation={conversation}
      isGenerating={false}
      hasCompletionUnread={false}
      collapsed={false}
      tooltipEnabled={false}
      batchMode={false}
      checked={false}
      selected={false}
      menuVisible={false}
      onToggleChecked={vi.fn()}
      onConversationClick={vi.fn()}
      onOpenMenu={vi.fn()}
      onMenuVisibleChange={vi.fn()}
      onEditStart={vi.fn()}
      onDelete={vi.fn()}
      onTogglePin={vi.fn()}
      getJobStatus={() => 'none'}
      {...overrides}
    />
  );
}

describe('ConversationRow loading indicator', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the white swirling SVG for an active non-batch conversation', () => {
    renderConversationRow({ isGenerating: true });

    const loader = screen.getByTestId('conversation-row-swirling-loader');
    expect(loader.tagName.toLowerCase()).toBe('svg');
    expect(loader.querySelector('.loading-ui-swirling-circle')).toBeInTheDocument();
    expect(loader).toHaveClass('size-16px');
    expect(loader).toHaveClass('text-white');
  });

  it('does not show the swirling SVG when batch selection is active', () => {
    renderConversationRow({ isGenerating: true, batchMode: true });

    expect(screen.queryByTestId('conversation-row-swirling-loader')).not.toBeInTheDocument();
  });
});
