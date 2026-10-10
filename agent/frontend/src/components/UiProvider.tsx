import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { DocModal } from './DocModal';

type ToastKind = 'ok' | 'err';
interface UiValue { toast: (text: string, kind?: ToastKind) => void; openDoc: (path: string) => void }
const UiContext = createContext<UiValue | null>(null);

export function UiProvider({children}: {children: ReactNode}) {
  const [notice, setNotice] = useState<{text: string; kind: ToastKind} | null>(null);
  const [docPath, setDocPath] = useState<string | null>(null);
  const toast = useCallback((text: string, kind: ToastKind = 'ok') => {
    setNotice({text, kind}); window.setTimeout(() => setNotice(null), 4200);
  }, []);
  const value = useMemo(() => ({toast, openDoc: setDocPath}), [toast]);
  return <UiContext.Provider value={value}>{children}<DocModal path={docPath} onClose={() => setDocPath(null)}/>{notice && <div id="toast" className={`${notice.kind} show`}>{notice.text}</div>}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) throw new Error('useUi must be used inside UiProvider');
  return value;
}
