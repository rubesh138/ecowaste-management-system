export interface User {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  phone: string;
  address: string;
  role: 'citizen' | 'admin' | 'employee';
  status: 'active' | 'inactive';
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  totalRequests?: number;
  totalComplaints?: number;
}

export type WasteStatus =
  | 'Pending'
  | 'Under Review'
  | 'Accepted'
  | 'Scheduled'
  | 'Collected'
  | 'Completed'
  | 'Rejected';

export interface WasteRequest {
  _id: string;
  requestId: string;
  citizen: User | string;
  wasteType: string;
  quantity: string;
  quantityValue: number;
  unit: string;
  preferredDate: string;
  scheduledDate?: string;
  address: string;
  description?: string;
  image?: string;
  status: WasteStatus;
  adminResponse?: string;
  rejectionReason?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ComplaintStatus =
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type ComplaintCategory =
  | 'Missed Collection'
  | 'Improper Collection'
  | 'Waste Overflow'
  | 'Damaged Bin'
  | 'Illegal Dumping'
  | 'Other';

export interface Complaint {
  _id: string;
  complaintId: string;
  citizen: User | string;
  category: ComplaintCategory;
  description: string;
  address: string;
  image?: string;
  status: ComplaintStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecyclingStatus =
  | 'Received'
  | 'Processing'
  | 'Recycled'
  | 'Rejected';

export interface RecyclingRecord {
  _id: string;
  recordId: string;
  wasteType: string;
  quantity: number;
  unit: string;
  method: string;
  status: RecyclingStatus;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteInventory {
  wasteType: string;
  collected: number;
  used: number;
  available: number;
}

export interface RecyclingSummary {
  totalReceived: number;
  totalCollectedWaste: number;
  totalRecycled: number;
  totalProcessing: number;
  totalRejected: number;
  recyclingRate: number;
  inventory?: WasteInventory[];
}

export interface WasteCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'request' | 'complaint' | 'recycling' | 'system';
  relatedRequest?: {
    _id: string;
    requestId: string;
    status: string;
    wasteType: string;
  };
  relatedComplaint?: {
    _id: string;
    complaintId: string;
    status: string;
    category: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  // Admin stats
  totalCitizens?: number;
  totalRequests?: number;
  newRequests?: number;
  pendingRequests?: number;
  acceptedRequests?: number;
  scheduledCollections?: number;
  collectedCollections?: number;
  completedCollections?: number;
  rejectedRequests?: number;
  pendingComplaints?: number;
  resolvedComplaints?: number;
  totalRecycledWaste?: number;
  totalWasteCollected?: number;
  recyclingRate?: number;

  // Citizen stats
  pending?: number;
  accepted?: number;
  scheduled?: number;
  completed?: number;
  complaints?: number;
  totalWasteKg?: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface CollectionTrend {
  date: string;
  submitted: number;
  completed: number;
  weight: number;
}

export interface WasteTypeData {
  name: string;
  count: number;
  totalKg: number;
}

export interface MonthlyTrend {
  month: string;
  requests: number;
  completed: number;
  volumeKg: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  unreadCount?: number;
  summary?: RecyclingSummary;
}