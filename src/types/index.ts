export type Role =
  | "receptionist"
  | "production_manager"
  | "store_keeper"
  | "production_operator"
  | "recycling_operator"
  | "accounts"
  | "admin";

export type Stage = "Extrusion" | "Printing" | "Packaging" | "Stock" | "Ready to Sale";

export type JobCardStatus =
  | "Draft"
  | "PendingApproval"
  | "Approved"
  | "Issued"
  | "InProduction"
  | "Completed";

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: "Open" | "Completed";
  jobCardIds: string[];
}

export interface JobCardStageEntry {
  stage: Stage;
  sequenceOrder: number;
  required: boolean;
  status: "Pending" | "InProgress" | "Complete";
}

export interface JobCard {
  id: string;
  jobCardNumber: string;
  salesOrderId: string;
  modelName: string;
  qty: number;
  status: JobCardStatus;
  department: string;
  stages: JobCardStageEntry[];
}

export interface TraceResult {
  traceId: string;
  type: "SalesOrder" | "JobCard" | "MaterialBatch" | "GranulesBatch";
  currentStatus: string;
  currentStage?: Stage;
  history: { label: string; timestamp: string }[];
}

export interface WasteEntry {
  id: string;
  jobCardNumber: string;
  stage: Stage;
  wasteQty: number;
  unit: "kg";
  wasteType: string;
  sentToRecycling: boolean;
  date: string;
}

export interface GranulesBatch {
  id: string;
  batchNumber: string;
  date: string;
  inputWasteQty: number;
  granulesProducedKg: number;
  destination: "Restocked as raw material" | "Sold externally" | "Partially sold";
  reEnteredQty?: number;
  soldQty?: number;
  soldTo?: string;
}

export interface CostingRecord {
  id: string;
  itemOrModel: string;
  rawMaterialCost: number;
  productionCost: number;
  otherCost: number;
  currency: "USD" | "NGN" | "GHS" | "ZAR";
  exchangeRateUsed: number;
  totalCostLocal: number;
  lastUpdated: string;
}

export interface ExchangeRate {
  id: string;
  currency: string;
  rate: number;
  date: string;
  enteredBy: string;
}
