/**
 * @license
 * Copyright 2025 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IMessageAcpToolCall } from '@/common/chat/chatLib';
import { normalizeTraceToolDisplayText } from '@/common/chat/chatLib';
import { normalizeAcpToolCall } from '@/common/chat/normalizeToolCall';
import { describe, expect, it } from 'vitest';

describe('normalizeAcpToolCall', () => {
  it('normalizes object-shaped tool display fields without throwing', () => {
    const message = {
      id: 'tool-object-title',
      conversation_id: 'conv-1',
      type: 'acp_tool_call',
      content: {
        sessionId: 'sess-1',
        update: {
          sessionUpdate: 'tool_call_update',
          tool_call_id: 'tool-object-title',
          status: 'completed',
          title: { label: 'mcp__trace-team-search' },
          kind: 'execute',
          raw_input: {
            command: { value: 'bun test' },
          },
        },
      },
    } as unknown as IMessageAcpToolCall;

    const normalized = normalizeAcpToolCall(message);

    expect(normalized?.name).toBe('{"label":"trace/search"}');
    expect(normalized?.description).toBe('{"value":"bun test"}');
  });

  it('converts non-string display values before rewriting Trace team prefixes', () => {
    expect(normalizeTraceToolDisplayText({ tool: 'trace-team/read' })).toBe('{"tool":"trace/read"}');
  });

  it('preserves generated image paths for grouped tool summaries', () => {
    const message: IMessageAcpToolCall = {
      id: 'ig_test_image',
      conversation_id: 'conv-1',
      type: 'acp_tool_call',
      content: {
        sessionId: 'sess-1',
        update: {
          sessionUpdate: 'tool_call_update',
          tool_call_id: 'ig_test_image',
          status: 'completed',
          title: 'Image generation',
          kind: 'execute',
          raw_output: {
            image: {
              path: '/Users/test/.codex/generated_images/session/ig_test_image.png',
            },
          },
          content: [
            {
              type: 'content',
              content: {
                type: 'text',
                text: 'Revised prompt: 一张小猫照片',
              },
            },
          ],
        },
      },
    };

    const normalized = normalizeAcpToolCall(message);

    expect((normalized as { imagePath?: string } | undefined)?.imagePath).toBe(
      '/Users/test/.codex/generated_images/session/ig_test_image.png'
    );
  });
});
