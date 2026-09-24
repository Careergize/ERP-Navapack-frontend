import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { MOCK_JOB_CARDS } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { JobCard } from "@/types";

export function JobCardList() {
  const [cards, setCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<JobCard[]>("/job-cards/")
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error("Job cards API returned an invalid response");
        setCards(data);
      })
      .catch(() => setCards(MOCK_JOB_CARDS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Job Cards</h1>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-gray-500">Loading job cards…</p>}

        {cards.map((card) => (
          <Link key={card.id} to={`/job-cards/${card.id}`}>
            <Card className="flex items-center justify-between transition-shadow hover:shadow-md">
              <div>
                <p className="font-medium text-navy">{card.jobCardNumber}</p>
                <p className="text-sm text-gray-500">
                  {card.modelName} · Qty {card.qty} · {card.department}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {card.stages
                    .filter((s) => s.required)
                    .map((s) => (
                      <span
                        key={s.stage}
                        title={s.stage}
                        className={`h-2 w-6 rounded-full ${
                          s.status === "Complete"
                            ? "bg-green"
                            : s.status === "InProgress"
                            ? "bg-teal"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                </div>
                <StatusBadge status={card.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
