import { describe, expect, it } from 'vitest';
import { draftToMarkdown, markdownToDraft } from './draft';
import type { Draft } from './types';

describe('draft frontmatter', () => {
  it('在编辑后保留 domain/filename，并解析标量和数组字段', () => {
    const original: Draft = {domain:'guides',filename:'demo.md',frontmatter:{title:'旧标题'},body:'旧正文'};
    const markdown = '---\ntitle: "新标题"\ntags: [RAG, MCP]\nowner: 团队\n---\n\n# 新正文';
    expect(markdownToDraft(markdown, original)).toEqual({domain:'guides',filename:'demo.md',frontmatter:{title:'新标题',tags:['RAG','MCP'],owner:'团队'},body:'# 新正文'});
  });
  it('输出可再次解析的 markdown', () => {
    const draft: Draft = {domain:'metrics',filename:'fps.md',frontmatter:{title:'FPS',tags:['性能','指标']},body:'正文'};
    expect(markdownToDraft(draftToMarkdown(draft), draft)).toEqual(draft);
  });
});
