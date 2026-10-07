import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { MOCK_JOB_CARDS } from '@/lib/mockData';
import { normalizeJobCard, approveJobCard, issueJobMaterials, updateJobStage, transferJobToStock, editJobCard, toggleJobStage, type StageUpdate } from '@/lib/jobCards';
import { useAuth } from './AuthContext';
import { useSalesOrders } from './SalesOrdersContext';
import type { JobCard } from '@/types';

interface JobCardsState {
  cards: JobCard[];
  loading: boolean;
  usingDemo: boolean;
  load: () => Promise<void>;
  loadDetail: (id: string) => Promise<void>;
  approve: (id: string) => void;
  issue: (id: string, quantities: Record<string, number>, available: Record<string, number | null>) => void;
  updateStage: (id: string, stageId: string, update: StageUpdate) => void;
  transfer: (id: string, accepted: number, batchDate: string) => void;
  edit: (id: string, change: Parameters<typeof editJobCard>[1]) => void;
  toggleStage: (id: string, stageId: string) => void;
  saveSequence: (id: string) => Promise<boolean>;
}
const Context = createContext<JobCardsState | undefined>(undefined);
const validCard = (value: JobCard) => value && typeof value.id === 'string' && typeof value.jobCardNumber === 'string' && Array.isArray(value.stages);
export function JobCardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { orders } = useSalesOrders();
  const orderRef = useRef(orders); orderRef.current = orders;
  const [cards, setCards] = useState<JobCard[]>([]);
  const current = useRef<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const request = useRef<Promise<void>>();
  const details = useRef(new Map<string, Promise<void>>());
  const publish = (next: JobCard[]) => { current.current = next; setCards(next); };
  const load = useCallback(() => {
    if (!request.current) request.current = api.get<JobCard[]>('/job-cards/').then(({ data }) => {
      if (!Array.isArray(data) || !data.every(validCard)) throw new Error('Invalid job card response');
      publish(data.map(card => normalizeJobCard(card, orderRef.current)));
    }).catch(() => { publish(MOCK_JOB_CARDS.map(card => normalizeJobCard(card, orderRef.current))); setUsingDemo(true); }).finally(() => setLoading(false));
    return request.current;
  }, []);
  const loadDetail = useCallback((id: string) => {
    if (!details.current.has(id)) details.current.set(id, load().then(async () => {
      try {
        const { data } = await api.get<JobCard>(`/job-cards/${encodeURIComponent(id)}/`);
        if (!validCard(data) || data.id !== id) throw new Error('Invalid job card detail');
        const card = normalizeJobCard(data, orderRef.current);
        publish([...current.current.filter(c => c.id !== id), card]);
      } catch {
        // Keep the known list/mock record; unknown IDs remain a genuine not-found.
      }
    }));
    return details.current.get(id)!;
  }, [load]);
  const mutate = (id: string, change: (card: JobCard) => JobCard) => {
    if (!user) throw new Error('Sign in to update job cards.');
    const card = current.current.find(c => c.id === id);
    if (!card) throw new Error('Job card not found.');
    const next = change(card);
    publish(current.current.map(c => c.id === id ? next : c));
  };
  const saveSequence = async (id: string) => {
    if (!user || !['admin', 'receptionist', 'production_manager'].includes(user.role)) throw new Error('Your role cannot save stage requirements.');
    const card = current.current.find(c => c.id === id);
    if (!card || card.status === 'Completed') throw new Error('Completed job card stage requirements are locked.');
    let persisted = false;
    try { await api.patch(`/job-cards/${id}/stages/`, { stages: card.stages }); persisted = true; } catch { /* Existing API fallback stays explicit in the UI. */ }
    mutate(id, latest => ({ ...latest, activityHistory: [...(latest.activityHistory ?? []), { id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'Stage requirements saved', user: user.name, department: 'Production Manager', description: persisted ? 'Existing stage API accepted the request; manufacturing tracking remains frontend-only.' : 'Saved in frontend state only; stage API was unavailable.' }] }));
    return persisted;
  };
  return <Context.Provider value={{ cards, loading, usingDemo, load, loadDetail,
    approve: id => mutate(id, card => approveJobCard(card, user!)),
    issue: (id, quantities, available) => mutate(id, card => issueJobMaterials(card, quantities, available, user!)),
    updateStage: (id, stageId, update) => mutate(id, card => updateJobStage(card, stageId, update, user!)),
    transfer: (id, accepted, date) => mutate(id, card => transferJobToStock(card, accepted, date, user!)),
    edit: (id, change) => mutate(id, card => editJobCard(card, change, user!)),
    toggleStage: (id, stageId) => mutate(id, card => toggleJobStage(card, stageId, user!)), saveSequence,
  }}>{children}</Context.Provider>;
}
export function useJobCards() {
  const value = useContext(Context);
  if (!value) throw new Error('JobCardsProvider is required');
  return value;
}
