import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DocCard } from '../components/DocCard';
import { useUi } from '../components/UiProvider';
import { api, errorMessage } from '../lib/api';
import type { DocSummary, Status } from '../lib/types';

const meta: Record<string,[string,string]> = {
  _root:['仓库说明','规范与使用说明'], metrics:['指标与度量','指标含义、统计口径、正常范围'], product:['系统与工具','官网文档、功能清单、工具用法'], team:['组织与协作','成员分工、术语表、常用网站、周报需求'], guides:['流程指南','测试 SOP、值班运维、排查记录、报告纪要'], references:['公开资料','行业动态、方案调研、外部笔记'],
};
const fixed = ['metrics','product','team','guides','references'];
export function DocsPage() {
  const {toast}=useUi(); const qc=useQueryClient(); const [closed,setClosed]=useState<Set<string>>(new Set());
  const docs=useQuery({queryKey:['docs'],queryFn:()=>api<{docs:DocSummary[]}>('/api/docs')});
  const status=useMutation({mutationFn:({path,status}:{path:string;status:Status})=>api<{pushed:boolean}>('/api/doc/status',{path,status}),onSuccess:(_,v)=>{toast(`/${v.path} 状态已更新`);qc.invalidateQueries({queryKey:['docs']});},onError:e=>toast(`状态更新失败：${errorMessage(e)}`,'err')});
  const groups=new Map<string,DocSummary[]>(); for(const doc of docs.data?.docs||[]){const domain=doc.path.includes('/')?doc.path.split('/')[0]:'_root';groups.set(domain,[...(groups.get(domain)||[]),doc]);}
  const keys=[...new Set([...fixed,...groups.keys()])];
  return <section className="show"><div className="card"><h2>文档库</h2><p className="sub">点击任意文档查看全文，可直接在线编辑或删除</p>
    {docs.isPending?<div className="skeleton"><i/><i/><i/></div>:docs.isError?<div className="empty">加载失败：{errorMessage(docs.error)}</div>:<div className="result">{keys.map(domain=>{const items=groups.get(domain)||[];const [name,desc]=meta[domain]||[domain,''];const collapsed=closed.has(domain);return <div className={`domain-group ${collapsed?'collapsed':''}`} key={domain}><button className="domain-head" onClick={()=>setClosed(s=>{const n=new Set(s);n.has(domain)?n.delete(domain):n.add(domain);return n;})}><div className="domain-icon">{name.slice(0,1)}</div><div><div className="domain-title">{name} <span>{domain}/</span></div><div className="domain-desc">{desc}</div></div><span className="domain-count">{items.length} 篇</span><span className="domain-caret">⌄</span></button><div className="domain-body"><div className="domain-body-inner">{items.length?items.map(d=><DocCard key={d.path} doc={d} onStatus={(path,next)=>status.mutate({path,status:next})}/>):<div className="domain-empty">暂无文档，可在「新增」添加</div>}</div></div></div>})}</div>}
  </div></section>;
}
