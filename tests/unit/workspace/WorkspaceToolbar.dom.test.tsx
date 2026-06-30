/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import WorkspaceToolbar from '@/renderer/pages/conversation/Workspace/components/WorkspaceToolbar';
import { fireEvent, render, screen } from '@testing-library/react';
import type { TFunction } from 'i18next';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

type ButtonProps = {
  icon?: React.ReactNode;
  'aria-label'?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
};

type ChildrenProps = {
  children?: React.ReactNode;
};

type InputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

vi.mock('@/renderer/components/media/UploadProgressBar', () => ({
  default: () => null,
}));

vi.mock('@/renderer/utils/platform', () => ({
  isElectronDesktop: () => true,
}));

vi.mock('@icon-park/react', () => ({
  Down: () => <span data-testid='down-icon' />,
  FoldUpOne: () => <span data-testid='collapse-all-icon' />,
  Plus: () => <span data-testid='plus-icon' />,
  Refresh: ({ onClick }: { onClick?: () => void }) => (
    <span data-testid='refresh-icon' onClick={onClick} role='presentation' />
  ),
  Search: () => <span data-testid='search-icon' />,
}));

vi.mock('@arco-design/web-react', () => {
  const Menu = Object.assign(({ children }: ChildrenProps) => <div>{children}</div>, {
    Item: ({ children }: ChildrenProps) => <div>{children}</div>,
  });

  return {
    Button: ({ icon, 'aria-label': ariaLabel, onClick, className, children }: ButtonProps) => (
      <button type='button' aria-label={ariaLabel} className={className} onClick={onClick}>
        {icon}
        {children}
      </button>
    ),
    Dropdown: ({ children }: ChildrenProps) => <>{children}</>,
    Input: ({ placeholder, value, onChange }: InputProps) => (
      <input aria-label={placeholder} value={value} onChange={(event) => onChange?.(event.currentTarget.value)} />
    ),
    Menu,
    Tooltip: ({ children }: ChildrenProps) => <>{children}</>,
  };
});

const t = ((key: string) => key) as TFunction;

function renderToolbar(overrides: Partial<React.ComponentProps<typeof WorkspaceToolbar>> = {}) {
  const props: React.ComponentProps<typeof WorkspaceToolbar> = {
    t,
    isWorkspaceCollapsed: false,
    setIsWorkspaceCollapsed: vi.fn(),
    workspaceDisplayName: 'Workspace',
    showSearch: false,
    searchText: '',
    setSearchText: vi.fn(),
    onSearch: vi.fn(),
    searchInputRef: React.createRef(),
    loading: false,
    refreshWorkspace: vi.fn(),
    onCollapseAll: vi.fn(),
    handleSelectHostFiles: vi.fn(),
    handleUploadDeviceFiles: vi.fn(),
    setShowHostFileSelector: vi.fn(),
    ...overrides,
  };

  render(<WorkspaceToolbar {...props} />);

  return props;
}

describe('WorkspaceToolbar collapse all', () => {
  it('calls the collapse all handler from the icon button', () => {
    const onCollapseAll = vi.fn();
    renderToolbar({ onCollapseAll });

    fireEvent.click(screen.getByRole('button', { name: 'conversation.workspace.collapseAll' }));

    expect(onCollapseAll).toHaveBeenCalledTimes(1);
  });

  it('hides the collapse all action when the workspace panel is collapsed', () => {
    renderToolbar({ isWorkspaceCollapsed: true });

    expect(screen.queryByRole('button', { name: 'conversation.workspace.collapseAll' })).not.toBeInTheDocument();
  });
});
