import type { JobCard, SalesOrder, TraceResult } from "@/types";

export const MOCK_SALES_ORDERS: SalesOrder[] = [
  { id: "so-1", orderNumber: "SO-1042", customerName: "Kano Retail Group", date: "2026-09-15", status: "Open", jobCardIds: ["jc-1", "jc-2"] },
  { id: "so-2", orderNumber: "SO-1043", customerName: "Lagos Wholesale Traders", date: "2026-09-18", status: "Open", jobCardIds: ["jc-3"] },
  { id: "so-3", orderNumber: "SO-1039", customerName: "Accra Distributors Ltd", date: "2026-09-10", status: "Completed", jobCardIds: ["jc-4"] },
];

export const MOCK_JOB_CARDS: JobCard[] = [
  {
    id: "jc-1",
    jobCardNumber: "JC-2201",
    salesOrderId: "so-1",
    modelName: "Woven Sack 25kg",
    qty: 5000,
    status: "InProduction",
    department: "Extrusion",
    stages: [
      { stage: "Extrusion", sequenceOrder: 1, required: true, status: "Complete" },
      { stage: "Printing", sequenceOrder: 2, required: true, status: "InProgress" },
      { stage: "Packaging", sequenceOrder: 3, required: true, status: "Pending" },
      { stage: "Stock", sequenceOrder: 4, required: true, status: "Pending" },
      { stage: "Ready to Sale", sequenceOrder: 5, required: true, status: "Pending" },
    ],
  },
  {
    id: "jc-2",
    jobCardNumber: "JC-2202",
    salesOrderId: "so-1",
    modelName: "Print-Only Labels",
    qty: 2000,
    status: "PendingApproval",
    department: "Printing",
    stages: [
      { stage: "Extrusion", sequenceOrder: 1, required: false, status: "Pending" },
      { stage: "Printing", sequenceOrder: 2, required: true, status: "Pending" },
      { stage: "Packaging", sequenceOrder: 3, required: false, status: "Pending" },
      { stage: "Stock", sequenceOrder: 4, required: true, status: "Pending" },
      { stage: "Ready to Sale", sequenceOrder: 5, required: true, status: "Pending" },
    ],
  },
  {
    id: "jc-3",
    jobCardNumber: "JC-2203",
    salesOrderId: "so-2",
    modelName: "Plastic Bag 10kg",
    qty: 8000,
    status: "Approved",
    department: "Extrusion",
    stages: [
      { stage: "Extrusion", sequenceOrder: 1, required: true, status: "Pending" },
      { stage: "Printing", sequenceOrder: 2, required: true, status: "Pending" },
      { stage: "Packaging", sequenceOrder: 3, required: true, status: "Pending" },
      { stage: "Stock", sequenceOrder: 4, required: true, status: "Pending" },
      { stage: "Ready to Sale", sequenceOrder: 5, required: true, status: "Pending" },
    ],
  },
  {
    id: "jc-4",
    jobCardNumber: "JC-2150",
    salesOrderId: "so-3",
    modelName: "Woven Sack 50kg",
    qty: 3000,
    status: "Completed",
    department: "Packaging",
    stages: [
      { stage: "Extrusion", sequenceOrder: 1, required: true, status: "Complete" },
      { stage: "Printing", sequenceOrder: 2, required: true, status: "Complete" },
      { stage: "Packaging", sequenceOrder: 3, required: true, status: "Complete" },
      { stage: "Stock", sequenceOrder: 4, required: true, status: "Complete" },
      { stage: "Ready to Sale", sequenceOrder: 5, required: true, status: "Complete" },
    ],
  },
];

export const MOCK_TRACE_RESULT: TraceResult = {
  traceId: "JC-2201",
  type: "JobCard",
  currentStatus: "InProduction",
  currentStage: "Printing",
  history: [
    { label: "Sales Order SO-1042 created", timestamp: "Sep 15, 09:12" },
    { label: "Job Card approved by Production Manager", timestamp: "Sep 15, 14:30" },
    { label: "Raw material issued from Store", timestamp: "Sep 16, 08:05" },
    { label: "Extrusion complete", timestamp: "Sep 17, 17:40" },
    { label: "Printing started", timestamp: "Sep 18, 09:00" },
  ],
};
