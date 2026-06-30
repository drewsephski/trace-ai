/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import DrewLaunchNote from '@renderer/components/layout/DrewLaunchNote';

const STORAGE_KEY = 'trace:drew-launch-note-seen:v1';

describe('DrewLaunchNote', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('shows the first-launch note once, records it as seen, and hides after the timer', () => {
    render(<DrewLaunchNote />);

    expect(screen.getByText('common.drewLaunchNote.title')).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true');

    act(() => {
      vi.advanceTimersByTime(4200);
    });

    expect(screen.queryByText('common.drewLaunchNote.title')).toBeNull();
  });

  it('does not show the note after it has already been seen', () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');

    render(<DrewLaunchNote />);

    expect(screen.queryByText('common.drewLaunchNote.title')).toBeNull();
  });
});
