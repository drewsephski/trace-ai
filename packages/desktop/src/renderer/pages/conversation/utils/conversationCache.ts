/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import { isBackendHttpError } from '@/common/adapter/httpBridge';
import type { TChatConversation } from '@/common/config/storage';
import { mutate } from 'swr';

export const CONVERSATION_LOOKUP_TIMEOUT_MS = 15000;

const createTimeoutError = (operation: string, timeoutMs: number): Error => {
  const error = new Error(`${operation} timed out after ${timeoutMs}ms`);
  error.name = 'TimeoutError';
  return error;
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(createTimeoutError(operation, timeoutMs)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function getConversationOrNull(
  conversation_id: string,
  options: { timeoutMs?: number } = {}
): Promise<TChatConversation | null> {
  try {
    return await withTimeout(
      ipcBridge.conversation.get.invoke({ id: conversation_id }),
      options.timeoutMs ?? CONVERSATION_LOOKUP_TIMEOUT_MS,
      `conversation ${conversation_id} lookup`
    );
  } catch (error) {
    if (isBackendHttpError(error) && error.status === 404 && error.code === 'NOT_FOUND') {
      return null;
    }
    throw error;
  }
}

export async function refreshConversationCache(conversation_id: string): Promise<void> {
  const conversation = await getConversationOrNull(conversation_id);
  if (!conversation) return;

  await mutate<TChatConversation>(`conversation/${conversation_id}`, conversation, false);
}
