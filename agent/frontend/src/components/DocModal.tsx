import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, ImagePlus, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api, errorMessage, fileToBase64 } from '../lib/api';
import { stripFrontmatter } from '../lib/api';
import { Markdown } from './Markdown';
import { useUi } from './UiProvider';

export function DocModal({path, onClose}: {path: string | null; onClose: () => void}) {
  const {toast} = useUi(); const queryClient = useQueryClient();
  const [raw, setRaw] = useState(''); const [editing, setEditing] = useState(false); const [confirming, setConfirming] = useState(false); const [busy, setBusy] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setEditing(false); setConfirming(false); setRaw('');
    if (path) api<{content: string}>(`/api/doc?path=${encodeURIComponent(path)}`).then(r => setRaw(r.content)).catch(e => {toast(errorMessage(e), 'err'); onClose();});
  }, [path]);
  async function save() {
    if (!path) return; setBusy(true);
    try { const r = await api<{rel: string; pushed: boolean; unchanged?: boolean}>('/api/update', {path, content: raw}); toast(r.unchanged ? '内容无变化' : `保存成功：/${r.rel}${r.pushed ? '（已推送 main）' : ''}`); setEditing(false); await queryClient.invalidateQueries({queryKey:['docs']}); }
    catch (e) { toast(`保存失败：${errorMessage(e)}`, 'err'); } finally { setBusy(false); }
  }
  async function remove() {
    if (!path) return; setBusy(true);
    try { const r = await api<{rel: string; pushed: boolean}>('/api/delete', {path}); toast(`已删除：/${r.rel}${r.pushed ? '（已推送 main）' : ''}`); await queryClient.invalidateQueries({queryKey:['docs']}); onClose(); }
    catch (e) { toast(`删除失败：${errorMessage(e)}`, 'err'); setBusy(false); }
  }
  async function insertImage(file: File) {
    setBusy(true);
    try {
      const r = await api<{path: string}>('/api/upload-image', {filename:file.name, data:await fileToBase64(file)});
      const el = textarea.current; const start = el?.selectionStart ?? raw.length; const end = el?.selectionEnd ?? raw.length;
      const markdown = `\n![${file.name.replace(/\.[^.]+$/, '')}](${r.path})\n`;
      setRaw(raw.slice(0, start) + markdown + raw.slice(end)); toast('图片已插入并保存到 assets/');
    } catch(e) { toast(`图片上传失败：${errorMessage(e)}`, 'err'); } finally { setBusy(false); }
  }
  return <Dialog.Root open={Boolean(path)} onOpenChange={open => !open && onClose()}><Dialog.Portal><Dialog.Overlay className="doc-modal-overlay"><Dialog.Content className="doc-modal" aria-describedby={undefined}>
    <div className="doc-modal-head"><Dialog.Title className="dm-title">{editing ? '编辑 ' : ''}/{path}</Dialog.Title><div className="dm-actions">
      {!editing && <><button className="btn-ghost" onClick={() => setEditing(true)}><Pencil/>编辑</button><button className="btn-ghost danger" onClick={() => setConfirming(true)}><Trash2/>删除</button></>}
      <Dialog.Close className="doc-modal-close" aria-label="关闭"><X/></Dialog.Close>
    </div></div>
    <div className="doc-modal-body">
      {confirming && <div className="confirm-bar"><span>确认删除 /{path}？此操作会同步推送到 main（可从 git 历史恢复）。</span><button className="btn-ghost danger" disabled={busy} onClick={remove}>确认删除</button><button className="btn-ghost" onClick={() => setConfirming(false)}>取消</button></div>}
      {!raw ? <div className="skeleton"><i/><i/><i/></div> : editing ? <>
        <div className="section-title">含 frontmatter，保存后自动校验并发布</div>
        <div className="doc-actions"><label className="btn-ghost"><ImagePlus/>插入图片<input hidden type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" onChange={e => e.target.files?.[0] && insertImage(e.target.files[0])}/></label><span className="hint">支持粘贴图片，右侧实时预览</span></div>
        <div className="edit-split"><div className="edit-pane"><div className="edit-pane-label"><Pencil/>Markdown 源文</div><textarea ref={textarea} className="edit-area" value={raw} onChange={e => setRaw(e.target.value)} onPaste={e => {const file=[...e.clipboardData.items].find(x=>x.type.startsWith('image/'))?.getAsFile(); if(file){e.preventDefault(); insertImage(file);}}}/></div>
        <div className="edit-pane"><div className="edit-pane-label"><Eye/>实时预览</div><Markdown className="md edit-preview">{stripFrontmatter(raw)}</Markdown></div></div>
        <div className="doc-actions"><button className="btn-primary-sm" disabled={busy} onClick={save}>{busy ? '校验 · 发布中…' : '保存并发布'}</button><button className="btn-ghost" onClick={() => setEditing(false)}>取消</button></div>
      </> : <Markdown>{stripFrontmatter(raw)}</Markdown>}
    </div>
  </Dialog.Content></Dialog.Overlay></Dialog.Portal></Dialog.Root>;
}
