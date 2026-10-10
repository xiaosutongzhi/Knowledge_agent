import type { DocSummary, Status } from '../lib/types';
import { useUi } from './UiProvider';

const types: Record<string,string> = {Metric:'指标',Feature:'功能',Context:'上下文',Case:'案例',Guide:'指南',Reference:'资料',Template:'模板',Decision:'决策',Playbook:'案例','API Endpoint':'功能',Workflow:'指南',Runbook:'指南'};
const statuses = {ready:['可直接用','ok'],review:['待确认','warn'],verify:['待验证','info']} as const;
export function DocCard({doc, onStatus}: {doc: DocSummary; onStatus?: (path:string,status:Status)=>void}) {
  const {openDoc}=useUi(); const status=doc.status || 'ready'; const [label, color]=statuses[status];
  const actions: [Status,string][] = status==='review' ? [['ready','确认发布'],['verify','标记待验证']] : status==='verify' ? [['ready','确认发布'],['review','撤回']] : [['review','撤回（待确认）']];
  return <div className="hit"><div className="hit-main" onClick={() => openDoc(doc.path)}><div className="t"><span className="tag">{types[doc.type] || doc.type || '文档'}</span>{doc.title}</div><div className="m">/{doc.path}</div>{doc.description && <div className="d">{doc.description}</div>}</div>
    <div className="hit-foot"><span className={`status-badge st-${color}`}>{label}</span>{onStatus && <div className="hit-actions">{actions.map(([next,text])=><button key={next} className="btn-ghost ss-btn" onClick={e=>{e.stopPropagation();onStatus(doc.path,next);}}>{text}</button>)}</div>}</div></div>;
}
