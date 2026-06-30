/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import GuidActionRow from '@/renderer/pages/guid/components/GuidActionRow';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/common', () => ({
  ipcBridge: {
    dialog: {
      showOpen: {
        invoke: vi.fn(),
      },
    },
  },
}));

vi.mock('@/renderer/utils/platform', () => ({
  isElectronDesktop: () => true,
}));

const defaultProps = {
  files: [],
  onFilesUploaded: vi.fn(),
  modelSelectorNode: null,
  selectedMode: 'default',
  onModeSelect: vi.fn(),
  allSkills: [],
  disabledBuiltinSkills: [],
  enabledSkills: [],
  onToggleSkill: vi.fn(),
  mcpServers: [],
  selectedMcpServerIds: [],
  onToggleMcpServer: vi.fn(),
  loading: false,
  isButtonDisabled: false,
  onSend: vi.fn(),
};

describe('GuidActionRow send button loading indicator', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders a white TwinOrbit status indicator while sending', () => {
    render(<GuidActionRow {...defaultProps} loading isButtonDisabled />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveTextContent('common.loading');
    expect(loader).toHaveClass('size-4px');
    expect(loader).toHaveClass('text-white');
    expect(loader.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it('does not render the TwinOrbit indicator when idle', () => {
    render(<GuidActionRow {...defaultProps} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
