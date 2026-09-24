import type { CostingRecord, ExchangeRate, GranulesBatch, JobCard, SalesOrder, TraceResult, WasteEntry } from "@/types";

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

export const MOCK_TRACE_RESULTS: Record<string, TraceResult> = {
  "SO-1042": {
    traceId: "SO-1042",
    type: "SalesOrder",
    currentStatus: "Open",
    history: [
      { label: "Sales Order created — Kano Retail Group", timestamp: "Sep 15, 09:12" },
      { label: "Job Card JC-2201 allocated", timestamp: "Sep 15, 09:15" },
      { label: "Job Card JC-2202 allocated", timestamp: "Sep 15, 09:20" },
    ],
  },
  "JC-2201": {
    traceId: "JC-2201",
    type: "JobCard",
    currentStatus: "InProduction",
    currentStage: "Printing",
    history: [
      { label: "Sales Order SO-1042 created", timestamp: "Sep 15, 09:12" },
      { label: "Job Card approved by Production Manager", timestamp: "Sep 15, 14:30" },
      { label: "Raw material issued from Store", timestamp: "Sep 16, 08:05" },
      { label: "Extrusion complete — 85 kg waste generated", timestamp: "Sep 17, 17:40" },
      { label: "Printing started", timestamp: "Sep 18, 09:00" },
    ],
  },
  "JC-2150": {
    traceId: "JC-2150",
    type: "JobCard",
    currentStatus: "Completed",
    currentStage: "Ready to Sale",
    history: [
      { label: "Sales Order SO-1039 created", timestamp: "Sep 10, 10:00" },
      { label: "Job Card approved", timestamp: "Sep 10, 15:00" },
      { label: "All 5 stages completed", timestamp: "Sep 13, 18:20" },
      { label: "Moved to Ready to Sale", timestamp: "Sep 13, 18:25" },
    ],
  },
  "RM-8834": {
    traceId: "RM-8834",
    type: "MaterialBatch",
    currentStatus: "In stock",
    history: [
      { label: "Purchased from supplier — 500 kg HDPE resin", timestamp: "Sep 14, 11:00" },
      { label: "120 kg issued to Job Card JC-2201", timestamp: "Sep 16, 08:05" },
      { label: "380 kg remaining in Raw Material Stock", timestamp: "Sep 16, 08:05" },
    ],
  },
  "GB-0501": {
    traceId: "GB-0501",
    type: "GranulesBatch",
    currentStatus: "Restocked as raw material",
    history: [
      { label: "105 kg waste received from JC-2201 (Extrusion + Printing)", timestamp: "Sep 18, 10:00" },
      { label: "92 kg granules produced", timestamp: "Sep 18, 15:40" },
      { label: "92 kg re-entered Raw Material Stock as RM-9012", timestamp: "Sep 18, 16:00" },
    ],
  },
};

export const MOCK_WASTE_ENTRIES: WasteEntry[] = [
  { id: "w-1", jobCardNumber: "JC-2201", stage: "Extrusion", wasteQty: 85, unit: "kg", wasteType: "Extrusion trim", sentToRecycling: true, date: "2026-09-17" },
  { id: "w-2", jobCardNumber: "JC-2201", stage: "Printing", wasteQty: 22, unit: "kg", wasteType: "Print misprint", sentToRecycling: true, date: "2026-09-18" },
  { id: "w-3", jobCardNumber: "JC-2150", stage: "Packaging", wasteQty: 40, unit: "kg", wasteType: "Off-cuts", sentToRecycling: true, date: "2026-09-11" },
  { id: "w-4", jobCardNumber: "JC-2203", stage: "Extrusion", wasteQty: 33, unit: "kg", wasteType: "Extrusion trim", sentToRecycling: false, date: "2026-09-19" },
];

export const MOCK_GRANULES_BATCHES: GranulesBatch[] = [
  { id: "g-1", batchNumber: "GB-0501", date: "2026-09-18", inputWasteQty: 105, granulesProducedKg: 92, destination: "Restocked as raw material", reEnteredQty: 92 },
  { id: "g-2", batchNumber: "GB-0498", date: "2026-09-12", inputWasteQty: 40, granulesProducedKg: 34, destination: "Sold externally", soldQty: 34, soldTo: "Accra Distributors Ltd" },
  { id: "g-3", batchNumber: "GB-0503", date: "2026-09-20", inputWasteQty: 60, granulesProducedKg: 51, destination: "Partially sold", reEnteredQty: 20, soldQty: 31, soldTo: "Kano Retail Group" },
];

export const MOCK_COSTING_RECORDS: CostingRecord[] = [
  { id: "c-1", itemOrModel: "Woven Sack 25kg", rawMaterialCost: 1250, productionCost: 340, otherCost: 60, currency: "USD", exchangeRateUsed: 1550, totalCostLocal: 2557500, lastUpdated: "2026-09-18" },
  { id: "c-2", itemOrModel: "Plastic Bag 10kg", rawMaterialCost: 640, productionCost: 210, otherCost: 35, currency: "USD", exchangeRateUsed: 1550, totalCostLocal: 1364750, lastUpdated: "2026-09-16" },
  { id: "c-3", itemOrModel: "Woven Sack 50kg", rawMaterialCost: 1890, productionCost: 480, otherCost: 90, currency: "USD", exchangeRateUsed: 1548, totalCostLocal: 3805920, lastUpdated: "2026-09-11" },
  { id: "c-4", itemOrModel: "Print-Only Labels", rawMaterialCost: 210, productionCost: 95, otherCost: 15, currency: "USD", exchangeRateUsed: 1552, totalCostLocal: 495040, lastUpdated: "2026-09-19" },
];

export const MOCK_EXCHANGE_RATES: ExchangeRate[] = [
  { id: "fx-1", currency: "USD", rate: 1552, date: "2026-09-19", enteredBy: "Femi (Accounts)" },
  { id: "fx-2", currency: "USD", rate: 1550, date: "2026-09-18", enteredBy: "Femi (Accounts)" },
  { id: "fx-3", currency: "USD", rate: 1548, date: "2026-09-11", enteredBy: "Femi (Accounts)" },
];
