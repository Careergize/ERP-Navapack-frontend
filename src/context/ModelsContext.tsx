import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { MOCK_MODELS } from '@/lib/mockData';
import { useAuth } from './AuthContext';
import type { Model } from '@/types';
import { reviseProductModel } from '@/lib/productModels';
const Context = createContext<{ models: Model[]; versions: Model[]; saveModel: (model: Model) => Model } | undefined>(undefined);
export function ModelsProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<Model[]>(() => MOCK_MODELS.map(m => ({ ...m, revision: 1 })));
  const current = useRef(versions); const { user } = useAuth();
  const models = versions.filter(m => !versions.some(n => n.id === m.id && (n.revision ?? 1) > (m.revision ?? 1)));
  const saveModel = (model: Model) => {
    if (!user || !['admin', 'production_manager', 'receptionist'].includes(user.role)) throw new Error('Your role cannot draft models.');
    const next = reviseProductModel(model, current.current); current.current = [...current.current, next]; setVersions(current.current); return next;
  };
  return <Context.Provider value={{ models, versions, saveModel }}>{children}</Context.Provider>;
}
export function useModels() { const value = useContext(Context); if (!value) throw new Error('ModelsProvider required'); return value; }
