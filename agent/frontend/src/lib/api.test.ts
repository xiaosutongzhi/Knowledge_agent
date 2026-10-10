import { describe, expect, it } from 'vitest';
import { consumeEvents } from './api';

describe('consumeEvents', () => {
  it('正确解析跨 chunk 的 SSE 事件和 UTF-8 中文', async () => {
    const encoder = new TextEncoder(); const seen: unknown[] = [];
    const parts = ['data: {"delta":"知', '识"}\n\ndata: {"done":true', '}\n\n'];
    const stream = new ReadableStream<Uint8Array>({start(controller){for(const part of parts)controller.enqueue(encoder.encode(part));controller.close();}});
    await consumeEvents(stream, event => seen.push(event));
    expect(seen).toEqual([{delta:'知识'},{done:true}]);
  });
});
