/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import type { MessageCursorPage } from '@/common/adapter/ipcBridge';
import type { TMessage } from '@/common/chat/chatLib';

export type MessageContentMode = 'compact' | 'full';

export type LoadConversationMessagePageOptions = {
  limit?: number;
  before?: string;
  after?: string;
  anchorMessageId?: string;
  contentMode?: MessageContentMode;
};

export const DEFAULT_MESSAGE_PAGE_LIMIT = 50;
export const MAX_MESSAGE_PAGE_LIMIT = 200;
export const MESSAGE_PAGE_LOAD_TIMEOUT_MS = 20000;

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

export async function loadConversationMessagePage(
  conversationId: string,
  options: LoadConversationMessagePageOptions = {}
): Promise<MessageCursorPage<TMessage>> {
  return withTimeout(
    ipcBridge.database.getConversationMessages.invoke({
      conversation_id: conversationId,
      limit: options.limit ?? DEFAULT_MESSAGE_PAGE_LIMIT,
      ...(options.before ? { before: options.before } : {}),
      ...(options.after ? { after: options.after } : {}),
      ...(options.anchorMessageId ? { anchor_message_id: options.anchorMessageId } : {}),
      content_mode: options.contentMode ?? 'compact',
    }),
    MESSAGE_PAGE_LOAD_TIMEOUT_MS,
    `conversation ${conversationId} messages lookup`
  );
}

export function loadLatestConversationMessages(
  conversationId: string,
  options: Pick<LoadConversationMessagePageOptions, 'limit' | 'contentMode'> = {}
): Promise<MessageCursorPage<TMessage>> {
  return loadConversationMessagePage(conversationId, options);
}

export function loadConversationAnchorWindow(
  conversationId: string,
  messageId: string,
  options: Pick<LoadConversationMessagePageOptions, 'limit' | 'contentMode'> = {}
): Promise<MessageCursorPage<TMessage>> {
  return loadConversationMessagePage(conversationId, {
    ...options,
    anchorMessageId: messageId,
  });
}

export async function loadAllConversationMessagesPaged(
  conversationId: string,
  options: Pick<LoadConversationMessagePageOptions, 'limit' | 'contentMode'> = {}
): Promise<TMessage[]> {
  const limit = options.limit ?? MAX_MESSAGE_PAGE_LIMIT;
  const contentMode = options.contentMode ?? 'full';
  const latest = await loadConversationMessagePage(conversationId, { limit, contentMode });
  const pages: TMessage[][] = [latest.items];
  let before = latest.oldest_cursor ?? undefined;
  let hasMoreBefore = latest.has_more_before;

  while (hasMoreBefore && before) {
    const page = await loadConversationMessagePage(conversationId, {
      limit,
      before,
      contentMode,
    });
    pages.unshift(page.items);
    before = page.oldest_cursor ?? undefined;
    hasMoreBefore = page.has_more_before;
  }

  return pages.flat();
}
