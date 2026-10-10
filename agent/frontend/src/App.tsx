import { useQuery } from '@tanstack/react-query';
import { BarChart3, FilePlus2, Files, MessageCircle, MessagesSquare, Search } from 'lucide-react';
import { NavLink, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { api } from './lib/api';
const AddPage = lazy(() => import('./pages/AddPage').then(m => ({default:m.AddPage})));
const AskPage = lazy(() => import('./pages/AskPage').then(m => ({default:m.AskPage})));
const DocsPage = lazy(() => import('./pages/DocsPage').then(m => ({default:m.DocsPage})));
const MetricsPage = lazy(() => import('./pages/MetricsPage').then(m => ({default:m.MetricsPage})));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({default:m.SearchPage})));
const WeworkPage = lazy(() => import('./pages/WeworkPage').then(m => ({default:m.WeworkPage})));

const nav = [
  ['/add', '新增文档', FilePlus2], ['/search', '检索', Search], ['/ask', '智能问答', MessageCircle],
  ['/docs', '文档库', Files], ['/wework', '聊天沉淀', MessagesSquare], ['/metrics', '数据看板', BarChart3],
] as const;

const pages = {'/add': AddPage, '/search': SearchPage, '/ask': AskPage, '/docs': DocsPage, '/wework': WeworkPage, '/metrics': MetricsPage};

export function App() {
  const {pathname} = useLocation();
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {if (pathname in pages) setVisited(old => old.includes(pathname) ? old : [...old, pathname]);}, [pathname]);
  const status = useQuery({ queryKey: ['status'], queryFn: () => api<{llm: boolean}>('/api/status') });
  return <>
    <div className="ambient"><div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/><div className="blob blob-4"/></div>
    <div className="grain" />
    <header>
      <div className="logo"><div className="logo-mark">K</div><h1>内部知识库</h1></div>
      <p>团队内部知识库 · OKF v0.1 <span className={`badge ${status.data?.llm ? 'on' : 'off'}`}><i/>{status.isPending ? 'AI 检测中…' : status.isError ? '服务异常' : status.data?.llm ? 'AI 已接入' : 'AI 未配置 · 问答降级为检索'}</span></p>
    </header>
    <nav><div className="nav-inner">
      {nav.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({isActive}) => isActive ? 'active' : ''}><Icon/><span className="nav-label">{label}</span></NavLink>)}
    </div></nav>
    <main>
      {!(pathname in pages) && <Navigate to="/add" replace/>}
      {[...new Set([...visited, pathname])].filter(p => p in pages).map(p => {
        const Page = pages[p as keyof typeof pages];
        return <div key={p} hidden={p !== pathname}><Suspense fallback={<div className="skeleton"><i/><i/><i/></div>}><Page/></Suspense></div>;
      })}
    </main>
  </>;
}
