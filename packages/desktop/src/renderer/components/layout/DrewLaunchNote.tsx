/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'trace:drew-launch-note-seen:v1';
const NOTE_DURATION_MS = 4200;

function shouldShowLaunchNote(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

function markLaunchNoteSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

const DrewLaunchNote: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => shouldShowLaunchNote());

  useEffect(() => {
    if (!visible) return;
    markLaunchNoteSeen();
    const timeoutId = window.setTimeout(() => setVisible(false), NOTE_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className='fixed left-1/2 top-48px z-1000 w-[calc(100%-32px)] max-w-420px -translate-x-1/2 rounded-12px border border-solid border-border-2 bg-bg-2 px-18px py-14px shadow-[var(--aion-overlay-shadow)]'
      role='status'
      aria-live='polite'
    >
      <div className='text-12px font-500 uppercase tracking-1px text-t-tertiary'>
        {t('common.drewLaunchNote.title')}
      </div>
      <div className='mt-6px text-14px leading-22px text-t-primary'>{t('common.drewLaunchNote.message')}</div>
    </div>
  );
};

export default DrewLaunchNote;
