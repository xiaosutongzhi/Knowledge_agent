export type Status = 'ready' | 'review' | 'verify';
export interface DocSummary { path: string; title: string; type: string; description?: string; status?: Status; score?: number }
export interface PublishResult { rel: string; pushed: boolean; unchanged?: boolean; title?: string; skipped?: boolean }
export type Frontmatter = Record<string, string | string[]>;
export interface Draft { domain: string; filename: string; frontmatter: Frontmatter; body: string }
export interface Template { file: string; name: string; desc: string; type: string; fields: string[]; sections: string[] }
export interface PlanItem { action: 'create' | 'update'; domain: string; title: string; filename: string; target?: string; points?: string[]; type?: string; skip?: boolean }
export interface Plan { notes?: string; items: PlanItem[] }
export interface Gap { q: string; n: number; lastTs?: string }
export interface Message { role: 'user' | 'assistant'; content: string }
export interface StreamEvent { delta?: string; sessionId?: string; generate?: boolean; done?: boolean; error?: string; fallback?: boolean; hits?: DocSummary[]; step?: { tool: string; path?: string; query?: string } }
export interface Metrics {
  stock: number; freshness: number; stale: number; pending: number; reviewOnly: number;
  blindSpots: number; gapOccurrences: number; viewHeat: number; topDocs: {path: string; n: number}[];
  answerRate: number | null; askHits: number; askMisses: number; askTotal: number;
  autoRate: number | null; ai: number; human: number; freshDays: number;
  lastGovern?: {at: string; marked: number; pushed: boolean} | null;
}
export interface ArchiveMessage {
  seq: number; createTime: number; sender?: string; type?: string; chatId?: string; msgType: string;
  content?: string; fileName?: string; title?: string; mediaStatus?: string; sourceRecordId?: string;
  inSegment?: boolean; items?: {sender?: string; msgType: string; content?: string}[];
}
export type CandidateStatus = 'pending' | 'drafted' | 'published' | 'merged' | 'rejected';
export interface Candidate {
  id: string; title: string; status: CandidateStatus; sessionKey: string; sessionName?: string;
  sessionType?: string; participants?: string[]; asker?: string; question?: string; answer?: string;
  reason?: string; mode?: 'create' | 'append'; targetPath?: string; relatedDoc?: string; domain?: string;
  description?: string; tags?: string[]; draft?: string; claimedBy?: string; publishedPath?: string;
  publishedBy?: string; createdAt?: string; seqs?: number[];
}
export interface Session { key: string; name?: string; chatId?: string; type: string }
export interface ArchiveStats { candidates: Partial<Record<CandidateStatus, number>>; unprocessed: number; messages: number; diskBytes: number }
