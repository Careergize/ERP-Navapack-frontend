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
  | "StoreIssuePending"
  | "MaterialIssued"
  | "OnHold"
  | "ReadyForStock"
  | "Completed";

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: string;
}

export type CustomerType = "B2B" | "B2C";
export interface SalesOrderItem {
  id: string;
  itemId?: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  customerId?: string;
  marketingPersonName?: string;
  customerType?: CustomerType;
  requisitionOrder?: string;
  items?: SalesOrderItem[];
  orderTotal?: number;
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
  salesOrderNumber?: string;
  customerName?: string;
  product?: string;
  specifications?: string;
  productionRequirements?: string;
  unit?: string;
  createdDate?: string;
  requiredDate?: string;
  approval?: { approvedBy: string; approvedAt: string };
  requiredMaterials?: JobCardMaterial[];
  productionStages?: JobProductionStage[];
  activityHistory?: JobCardActivity[];
  acceptedQuantity?: number;
  stockTransfer?: { quantity: number; unit: string; batchDate: string; confirmedBy: string; confirmedAt: string; jobCardId: string; salesOrderId: string; customerName: string; modelName: string; product: string };
}

export interface JobCardMaterial {
  id: string;
  materialId?: string;
  name: string;
  requiredQuantity: number;
  issuedQuantity: number;
  unit: string;
}
export type ProductionStageStatus = "Pending" | "Received" | "InProgress" | "Completed" | "OnHold";
export interface JobProductionStage {
  id: string;
  name: string;
  department: string;
  sequence: number;
  required: boolean;
  kind: "production" | "stock";
  legacyStage?: Stage;
  status: ProductionStageStatus;
  inputQuantity: number | null;
  outputQuantity: number | null;
  wasteQuantity: number | null;
  inputUnit: string;
  outputUnit: string;
  wasteUnit: string;
  startedAt?: string;
  completedAt?: string;
  operator: string;
  remarks: string;
  handover?: { quantity: number; unit: string; fromStageId: string };
  wasteType?: string;
  wasteReason?: string;
  sentToRecycling?: number;
}
export interface JobCardActivity {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  department: string;
  description: string;
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

export interface Item {
  id: string;
  name: string;
  unit: string;
  category: string;
}

export interface Model {
  id: string;
  name: string;
  billOfMaterials: string;
  stages: Stage[];
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
}

export interface Supplier {
  id: string;
  name: string;
  materialSupplied: string;
  phone: string;
}

export interface Department {
  id: string;
  name: string;
  assignedProductionManager: string;
}

export interface MasterUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}
