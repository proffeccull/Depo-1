export interface CorporateAccount {
  id: string;
  userId: string;
  companyName: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  description?: string;
  contactPerson: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  csrBudget?: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCorporateRequest {
  companyName: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  description?: string;
  contactPerson: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  csrBudget?: number;
}

export interface UpdateCorporateRequest {
  companyName?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry?: string;
  description?: string;
  contactPerson?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  csrBudget?: number;
}

export interface CorporateTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'employee' | 'manager' | 'executive';
  department?: string;
  isActive: boolean;
  totalDonations: number;
  totalReceived: number;
  cyclesCompleted: number;
  joinedAt: string;
  lastActivity?: string;
}

export interface CorporateDonation {
  id: string;
  userId: string;
  amount: number;
  currency: 'NGN' | 'USD' | 'EUR';
  status: 'pending' | 'in_transit' | 'received' | 'obligated' | 'fulfilled' | 'defaulted';
  recipientName?: string;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

export interface CorporateAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  totalDonations: number;
  totalDonationAmount: number;
  averageDonationPerEmployee: number;
  completionRate: number;
  topDonors: {
    employeeId: string;
    employeeName: string;
    totalDonated: number;
    cyclesCompleted: number;
  }[];
  donationTrends: {
    period: string;
    donations: number;
    amount: number;
  }[];
  departmentBreakdown: {
    department: string;
    employees: number;
    totalDonated: number;
    averagePerEmployee: number;
  }[];
}

export interface BulkUserCreationRequest {
  users: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role?: 'employee' | 'manager' | 'executive';
    department?: string;
  }[];
}

export interface BulkDonationRequest {
  donations: {
    amount: number;
    currency: 'NGN' | 'USD' | 'EUR';
    employeeIds: string[];
    description?: string;
  }[];
}

export interface CSRTracking {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  utilizationRate: number;
  donationsByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  impactMetrics: {
    peopleHelped: number;
    communitiesSupported: number;
    projectsFunded: number;
  };
  quarterlyProgress: {
    quarter: string;
    budgetAllocated: number;
    amountSpent: number;
    initiativesCompleted: number;
  }[];
  upcomingDeadlines: {
    initiative: string;
    deadline: string;
    budgetRequired: number;
  }[];
}