/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Assistant } from '@/common/types/agent/assistantTypes';
import type { ManagedAgent } from '@/renderer/utils/model/agentTypes';

const sendTeamMessageMock = vi.fn();
const messageWarningMock = vi.fn();
const messageSuccessMock = vi.fn();
const mutateRuntimesMock = vi.fn();
const tMock = (_key: string, options?: { defaultValue?: string }) => options?.defaultValue || _key;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tMock,
    i18n: { language: 'en-US' },
  }),
}));

vi.mock('swr', () => ({
  default: () => ({
    data: managedAgents(),
    isLoading: false,
    isValidating: false,
    mutate: mutateRuntimesMock,
  }),
}));

vi.mock('@renderer/pages/conversation/hooks/useConversationAssistants', () => ({
  useConversationAssistants: () => ({
    presetAssistants: assistants(),
    isLoading: false,
  }),
}));

vi.mock('@/common', () => ({
  ipcBridge: {
    team: {
      sendMessage: { invoke: (...args: unknown[]) => sendTeamMessageMock(...args) },
    },
  },
}));

vi.mock('@/renderer/components/base/AionModal', () => ({
  default: ({ visible, title, footer, children }: Record<string, unknown>) =>
    visible ? (
      <section aria-label={String(title)}>
        <h1>{title as React.ReactNode}</h1>
        <div>{children as React.ReactNode}</div>
        <footer>{footer as React.ReactNode}</footer>
      </section>
    ) : null,
}));

vi.mock('@/renderer/components/base/AionSteps', () => {
  const Step = ({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) => (
    <div>
      <span>{title}</span>
      {description ? <small>{description}</small> : null}
    </div>
  );
  const Steps = ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>;
  return { default: Object.assign(Steps, { Step }) };
});

vi.mock('@arco-design/web-react', () => {
  const Button = ({
    children,
    disabled,
    icon: _icon,
    loading,
    onClick,
    type: _type,
    ...props
  }: {
    children?: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    loading?: boolean;
    onClick?: () => void;
    type?: string;
  }) => (
    <button {...props} type='button' disabled={disabled || loading} onClick={onClick}>
      {children}
    </button>
  );
  const Radio = ({
    children,
    value,
    ...props
  }: {
    children: (state: { checked: boolean }) => React.ReactNode;
    value: string;
  }) => (
    <label {...props}>
      <input type='radio' value={value} />
      {children({ checked: value === 'codex' })}
    </label>
  );
  Radio.Group = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const TextArea = ({ value, onChange, ...props }: { value: string; onChange: (value: string) => void }) => (
    <textarea value={value} onChange={(event) => onChange(event.target.value)} {...props} />
  );

  return {
    Button,
    Empty: ({ description }: { description: React.ReactNode }) => <div>{description}</div>,
    Input: { TextArea },
    Message: {
      success: (...args: unknown[]) => messageSuccessMock(...args),
      warning: (...args: unknown[]) => messageWarningMock(...args),
      error: vi.fn(),
    },
    Radio,
    Spin: () => <div>Loading</div>,
    Tag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import TeamOnboardingModal from '@/renderer/pages/team/components/TeamOnboardingModal';

describe('TeamOnboardingModal', () => {
  beforeEach(() => {
    sendTeamMessageMock.mockReset();
    messageWarningMock.mockReset();
    messageSuccessMock.mockReset();
    mutateRuntimesMock.mockReset();
    window.localStorage.clear();
  });

  it('shows a simple guided setup flow with runtime status', async () => {
    render(<TeamOnboardingModal visible teamId='team-1' onClose={vi.fn()} onTeamRunAck={vi.fn()} />);

    expect(screen.getByText('Runtimes')).toBeInTheDocument();
    expect(screen.getByText('Default agent')).toBeInTheDocument();
    expect(screen.getByText('Run tour')).toBeInTheDocument();
    expect(screen.getByText('Available agent runtimes')).toBeInTheDocument();
    expect(screen.getByText('Codex CLI')).toBeInTheDocument();
    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('team-onboarding-briefing')).not.toBeInTheDocument();
  });

  it('keeps the launch action blocked when the prompt is empty', async () => {
    render(<TeamOnboardingModal visible teamId='team-1' onClose={vi.fn()} onTeamRunAck={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save and continue' }));
    fireEvent.change(screen.getByTestId('team-onboarding-tour-prompt'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByTestId('team-onboarding-run-tour'));

    await waitFor(() => expect(messageWarningMock).toHaveBeenCalledWith('Enter a tour prompt first'));
    expect(sendTeamMessageMock).not.toHaveBeenCalled();
  });
});

function assistants(): Assistant[] {
  return [
    assistant({
      id: 'codex',
      name: 'Codex',
      source: 'generated',
      preset_agent_type: 'codex',
      agent: { type: 'acp', source: 'builtin', acp_backend: 'codex' },
    }),
    assistant({
      id: 'reviewer',
      name: 'Reviewer',
      source: 'generated',
      preset_agent_type: 'remote',
      agent: { type: 'remote', source: 'custom' },
    }),
  ];
}

function assistant(
  overrides: Partial<Assistant> & Pick<Assistant, 'id' | 'name' | 'source' | 'preset_agent_type'>
): Assistant {
  return {
    id: overrides.id,
    source: overrides.source,
    name: overrides.name,
    name_i18n: {},
    description_i18n: {},
    enabled: true,
    sort_order: 0,
    preset_agent_type: overrides.preset_agent_type,
    enabled_skills: [],
    custom_skill_names: [],
    disabled_builtin_skills: [],
    context_i18n: {},
    prompts: [],
    prompts_i18n: {},
    models: [],
    avatar: undefined,
    agent_status: 'online',
    team_selectable: true,
    team_block_reason: undefined,
    deletable: false,
    ...overrides,
  };
}

function managedAgents(): ManagedAgent[] {
  return [
    managedAgent({ id: 'codex-runtime', name: 'Codex CLI', backend: 'codex', installed: true, status: 'online' }),
    managedAgent({ id: 'claude-runtime', name: 'Claude CLI', backend: 'claude', installed: true, status: 'offline' }),
    managedAgent({
      id: 'remote-runtime',
      name: 'Remote Runner',
      backend: 'remote',
      installed: false,
      status: 'missing',
    }),
    managedAgent({
      id: 'aionrs-runtime',
      name: 'Aion CLI',
      backend: 'aionrs',
      agent_type: 'aionrs',
      agent_source: 'internal',
      installed: true,
      status: 'online',
    }),
  ];
}

function managedAgent(overrides: Partial<ManagedAgent> & Pick<ManagedAgent, 'id' | 'name'>): ManagedAgent {
  return {
    id: overrides.id,
    name: overrides.name,
    agent_type: 'acp',
    agent_source: 'builtin',
    enabled: true,
    installed: false,
    status: 'missing',
    team_capable: true,
    ...overrides,
  };
}
