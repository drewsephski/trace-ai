/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from '@arco-design/web-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

vi.mock('@/renderer/hooks/context/ThemeContext', () => ({
  useThemeContext: () => ({ theme: 'light' }),
}));

vi.mock('@/renderer/components/chat/EmojiPicker', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@arco-design/web-react', () => {
  const Button = ({
    children,
    loading: _loading,
    long: _long,
    type: _type,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; long?: boolean; type?: string }) => (
    <button type='button' {...props}>
      {children}
    </button>
  );
  const Input = ({
    onChange,
    ...props
  }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { onChange?: (value: string) => void }) => (
    <input {...props} onChange={(event) => onChange?.(event.currentTarget.value)} />
  );
  const Collapse = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Collapse.Item = ({ children, header }: { children: React.ReactNode; header?: React.ReactNode }) => (
    <section>
      {header}
      {children}
    </section>
  );
  return {
    Alert: ({ content }: { content: React.ReactNode }) => <div role='alert'>{content}</div>,
    Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Button,
    Collapse,
    ConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Input,
    Typography: {
      Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    },
  };
});

vi.mock('@uiw/react-codemirror', () => ({
  default: () => <div data-testid='codemirror-stub' />,
}));

const testCustomAgentMock = vi.fn();
vi.mock('@/common/adapter/ipcBridge', () => ({
  acpConversation: {
    testCustomAgent: { invoke: (...args: unknown[]) => testCustomAgentMock(...args) },
  },
}));

import InlineAgentEditor from '@/renderer/pages/settings/AgentSettings/InlineAgentEditor';

const renderEditor = () =>
  render(
    <ConfigProvider>
      <InlineAgentEditor onSave={vi.fn()} onCancel={vi.fn()} />
    </ConfigProvider>
  );

const fillCommandAndTest = async (user: ReturnType<typeof userEvent.setup>, command: string) => {
  const commandInput = screen.getByPlaceholderText('settings.commandPlaceholder');
  await act(async () => {
    await user.type(commandInput, command);
  });
  const testBtn = screen.getByRole('button', { name: /testConnectionBtn/i });
  await act(async () => {
    await user.click(testBtn);
  });
};

describe('InlineAgentEditor managed runtime feedback', () => {
  beforeEach(() => {
    testCustomAgentMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows fail_cli details returned by the backend', async () => {
    testCustomAgentMock.mockResolvedValue({
      step: 'fail_cli',
      error: 'managed node runtime unsupported on linux/x86',
    });
    const user = userEvent.setup();
    renderEditor();

    await fillCommandAndTest(user, 'npx @acme/agent');

    await waitFor(() => {
      expect(screen.getByText('settings.testConnectionFailCli')).toBeInTheDocument();
    });
    expect(screen.getByText(/managed node runtime unsupported/i)).toBeInTheDocument();
  });

  it('shows fail_acp details returned by the backend', async () => {
    testCustomAgentMock.mockResolvedValue({
      step: 'fail_acp',
      error: 'CLI exited before ACP initialize completed (status=1)',
    });
    const user = userEvent.setup();
    renderEditor();

    await fillCommandAndTest(user, 'npx @acme/agent');

    await waitFor(() => {
      expect(screen.getByText('settings.testConnectionFailAcp')).toBeInTheDocument();
    });
    expect(screen.getByText(/CLI exited before ACP initialize completed/i)).toBeInTheDocument();
  });
});
