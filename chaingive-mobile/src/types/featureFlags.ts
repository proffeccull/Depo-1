// Feature Flag Types
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: any;
  environments: {
    development: FlagEnvironment;
    staging: FlagEnvironment;
    production: FlagEnvironment;
  };
  targetingRules: TargetingRule[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface FlagEnvironment {
  enabled: boolean;
  value: any;
  rules: TargetingRule[];
  prerequisites: string[]; // Flag keys that must be enabled
  rolloutPercentage?: number;
}

export interface TargetingRule {
  id: string;
  name: string;
  description: string;
  conditions: TargetingCondition[];
  value: any;
  enabled: boolean;
  priority: number; // Higher priority rules are evaluated first
}

export interface TargetingCondition {
  attribute: string; // e.g., 'user.id', 'user.tier', 'user.role'
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'matches_regex';
  value: any;
  negate?: boolean;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  conditions: TargetingCondition[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlagAnalytics {
  flagKey: string;
  environment: 'development' | 'staging' | 'production';
  totalEvaluations: number;
  trueEvaluations: number;
  falseEvaluations: number;
  ruleMatches: Record<string, number>; // ruleId -> count
  userSegments: Record<string, number>; // segmentId -> count
  timeRange: {
    start: string;
    end: string;
  };
  hourlyStats: Array<{
    hour: string;
    evaluations: number;
    trueCount: number;
    falseCount: number;
  }>;
}

export interface FlagUsageEvent {
  flagKey: string;
  userId: string;
  value: any;
  ruleId?: string;
  segmentId?: string;
  environment: 'development' | 'staging' | 'production';
  timestamp: string;
  context: Record<string, any>; // Additional context like user properties
}

// LaunchDarkly Integration Types
export interface LaunchDarklyConfig {
  sdkKey: string;
  clientId?: string;
  user: LDUser;
  options?: {
    bootstrap?: any;
    sendEvents?: boolean;
    allAttributesPrivate?: boolean;
    privateAttributeNames?: string[];
    evaluationReasons?: boolean;
    sendEventsOnlyForVariation?: boolean;
  };
}

export interface LDUser {
  key: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  ip?: string;
  country?: string;
  anonymous?: boolean;
  custom?: Record<string, any>;
}

// API Response Types
export interface CreateFlagRequest {
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: any;
  tags?: string[];
}

export interface UpdateFlagRequest {
  name?: string;
  description?: string;
  defaultValue?: any;
  tags?: string[];
}

export interface UpdateEnvironmentRequest {
  enabled?: boolean;
  value?: any;
  rules?: TargetingRule[];
  prerequisites?: string[];
  rolloutPercentage?: number;
}

export interface CreateTargetingRuleRequest {
  name: string;
  description: string;
  conditions: TargetingCondition[];
  value: any;
  priority: number;
}

export interface FlagListResponse {
  flags: FeatureFlag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EnvironmentListResponse {
  environments: Array<{
    key: string;
    name: string;
    color: string;
    defaultTtl?: number;
  }>;
}

// Form Types for UI
export interface FlagFormData {
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: any;
  tags: string[];
}

export interface TargetingRuleFormData {
  name: string;
  description: string;
  conditions: TargetingCondition[];
  value: any;
  priority: number;
}

export interface EnvironmentFormData {
  enabled: boolean;
  value: any;
  rolloutPercentage?: number;
  prerequisites: string[];
}

// Analytics Types
export interface FlagMetrics {
  flagKey: string;
  environment: string;
  period: 'hour' | 'day' | 'week' | 'month';
  data: Array<{
    timestamp: string;
    evaluations: number;
    trueRate: number;
    falseRate: number;
  }>;
}

export interface FlagHealth {
  flagKey: string;
  environment: string;
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  lastEvaluated: string;
  evaluationCount: number;
  errorRate: number;
}