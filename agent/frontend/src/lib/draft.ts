import type { Draft, Frontmatter } from './types';
export function draftToMarkdown(doc: Draft) {
  const fields = Object.entries(doc.frontmatter).map(([key, value]) => `${key}: ${Array.isArray(value) ? `[${value.join(', ')}]` : JSON.stringify(value)}`);
  return `---\n${fields.join('\n')}\n---\n\n${doc.body || ''}`;
}
export function markdownToDraft(raw: string, original: Draft): Draft {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error('格式错误：缺少 frontmatter');
  const frontmatter: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith('[') && value.endsWith(']')) frontmatter[kv[1]] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else {
      if (value.startsWith('"')) { try { value = JSON.parse(value); } catch { value = value.replace(/^"|"$/g, ''); } }
      else value = value.replace(/^'|'$/g, '');
      frontmatter[kv[1]] = value;
    }
  }
  return {...original, frontmatter, body: match[2].trim()};
}
