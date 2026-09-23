import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GripVertical, X } from "lucide-react";
import { api } from "@/lib/api";
import { MOCK_JOB_CARDS } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import type { JobCard, JobCardStageEntry, Stage } from "@/types";

const ALL_STAGES: Stage[] = ["Extrusion", "Printing", "Packaging", "Stock", "Ready to Sale"];

export function JobCardDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [card, setCard] = useState<JobCard | null>(null);
  const [saving, setSaving] = useState(false);

  const canEditStages = user?.role === "receptionist" || user?.role === "admin";

  useEffect(() => {
    api
      .get<JobCard>(`/job-cards/${id}/`)
      .then(({ data }) => setCard(data))
      .catch(() => setCard(MOCK_JOB_CARDS.find((c) => c.id === id) ?? MOCK_JOB_CARDS[0]));
  }, [id]);

  function toggleStage(stage: Stage) {
    if (!card) return;
    const exists = card.stages.find((s) => s.stage === stage);
    const stages = exists
      ? card.stages.map((s) => (s.stage === stage ? { ...s, required: !s.required } : s))
      : [...card.stages, { stage, sequenceOrder: card.stages.length + 1, required: true, status: "Pending" as const }];
    setCard({ ...card, stages });
  }

  async function saveStages() {
    if (!card) return;
    setSaving(true);
    try {
      await api.patch(`/job-cards/${card.id}/stages/`, { stages: card.stages });
    } catch {
      // No backend yet in demo mode — the change already reflects in local state above.
    } finally {
      setSaving(false);
    }
  }

  if (!card) return <p className="text-sm text-gray-500">Loading job card…</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{card.jobCardNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {card.modelName} · Qty {card.qty} · {card.department}
          </p>
        </div>
        <StatusBadge status={card.status} />
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium text-navy">Production stages</h2>
          {canEditStages && (
            <span className="text-xs text-gray-400">
              This order doesn't need every stage — remove any that don't apply
            </span>
          )}
        </div>

        <div className="space-y-2">
          {ALL_STAGES.map((stage) => {
            const entry: JobCardStageEntry | undefined = card.stages.find((s) => s.stage === stage);
            const active = entry?.required ?? false;

            return (
              <div
                key={stage}
                className={`flex items-center justify-between rounded-card border px-4 py-3 ${
                  active ? "border-gray-100 bg-white" : "border-dashed border-gray-200 bg-surface opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {canEditStages && <GripVertical size={16} className="text-gray-300" />}
                  <span className="text-sm font-medium text-ink">{stage}</span>
                </div>

                <div className="flex items-center gap-3">
                  {active && entry && <StatusBadge status={entry.status} />}
                  {canEditStages && active && (
                    <button onClick={() => toggleStage(stage)} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  )}
                  {canEditStages && !active && (
                    <button
                      onClick={() => toggleStage(stage)}
                      className="text-xs font-medium text-blue hover:underline"
                    >
                      Add stage
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {canEditStages && (
          <button
            onClick={saveStages}
            disabled={saving}
            className="mt-5 rounded-card bg-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save stage sequence"}
          </button>
        )}
      </Card>
    </div>
  );
}
