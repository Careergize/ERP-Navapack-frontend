const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600",
  PendingApproval: "bg-navy/10 text-navy",
  Approved: "bg-blue/10 text-blue",
  Issued: "bg-blue/10 text-blue",
  InProduction: "bg-teal/10 text-teal",
  Pending: "bg-gray-100 text-gray-600",
  InProgress: "bg-teal/10 text-teal",
  Completed: "bg-green/10 text-green",
  Complete: "bg-green/10 text-green",
  Open: "bg-blue/10 text-blue",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
