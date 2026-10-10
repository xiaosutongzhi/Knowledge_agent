import type { StreamEvent } from './types';

export async function api<T>(url: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    ...(body !== undefined ? {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)} : {}),
    signal,
  });
  const data = await response.json();
  if (!response.ok || data?.error) throw new Error(data?.error || `HTTP ${response.status}`);
  return data as T;
}

// 同时用于问答与访谈；按 SSE 事件边界缓冲，处理跨网络包与 UTF-8 边界。
export async function consumeEvents(stream: ReadableStream<Uint8Array>, onEvent: (event: StreamEvent) => void) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const dispatch = (block: string) => {
    const payload = block.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!payload || payload === '[DONE]') return;
    const event = JSON.parse(payload) as StreamEvent;
    if (event.error) throw new Error(event.error);
    onEvent(event);
  };
  try {
    for (;;) {
      const {value, done} = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, {stream: true});
      let match: RegExpExecArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        dispatch(buffer.slice(0, match.index));
        buffer = buffer.slice(match.index + match[0].length);
      }
      if (done) { if (buffer.trim()) dispatch(buffer); break; }
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
}

export async function streamApi(url: string, body: unknown, onEvent: (event: StreamEvent) => void, signal?: AbortSignal) {
  const response = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body), signal});
  if (!response.ok || !response.headers.get('Content-Type')?.includes('text/event-stream')) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  if (!response.body) throw new Error('响应没有可读取的内容');
  await consumeEvents(response.body, onEvent);
}

export async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);
export const domains = [['metrics', '指标与度量'], ['product', '系统与工具'], ['team', '组织与协作'], ['guides', '流程指南'], ['references', '公开资料']] as const;
export const stripFrontmatter = (text: string) => text.replace(/^---[\s\S]*?---\s*/, '');
