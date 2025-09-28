// System Administration types for SUPER_ADMIN functionality

export type SystemStatus = 'HEALTHY' | 'WARNING' | 'ERROR' | 'MAINTENANCE'
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'TERMINATED'
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED'
export type PlanType = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM'
export type IntegrationType = 'PAYMENT' | 'EMAIL' | 'SMS' | 'STORAGE' | 'ANALYTICS' | 'BACKUP'
export type SystemLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
export type MaintenanceType = 'SCHEDULED' | 'EMERGENCY' | 'UPDATE' | 'SECURITY'

// System Settings interfaces
export interface SystemSettings {
  id: string

  // General Settings
  systemName: string
  systemVersion: string
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'

  // Security Settings
  passwordPolicy: PasswordPolicy
  sessionSettings: SessionSettings
  twoFactorRequired: boolean
  ipWhitelistEnabled: boolean
  allowedIpRanges: string[]

  // Feature Toggles
  features: FeatureToggle[]

  // Email Settings
  emailSettings: EmailSettings

  // Storage Settings
  storageSettings: StorageSettings

  // Backup Settings
  backupSettings: BackupSettings

  // Rate Limiting
  rateLimiting: RateLimitSettings

  // Monitoring
  monitoringSettings: MonitoringSettings

  updatedAt: string
  updatedBy: string
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // days
  historyCount: number
  lockoutAttempts: number
  lockoutDuration: number // minutes
}

export interface SessionSettings {
  timeoutMinutes: number
  maxConcurrentSessions: number
  requireReauthForSensitive: boolean
  rememberMeEnabled: boolean
  rememberMeDays: number
}

export interface FeatureToggle {
  id: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  targetTenants: string[]
  environments: string[]
}

export interface EmailSettings {
  provider: 'SMTP' | 'SENDGRID' | 'MAILGUN' | 'AWS_SES'
  host?: string
  port?: number
  secure: boolean
  username: string
  fromAddress: string
  fromName: string
  replyToAddress?: string
  templatesEnabled: boolean
  trackingEnabled: boolean
}

export interface StorageSettings {
  provider: 'LOCAL' | 'AWS_S3' | 'AZURE_BLOB' | 'GCS'
  region?: string
  bucket?: string
  maxFileSize: number // MB
  allowedFileTypes: string[]
  retentionDays: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

export interface BackupSettings {
  enabled: boolean
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  time: string // HH:MM format
  retentionDays: number
  includeFiles: boolean
  compressionEnabled: boolean
  encryptionEnabled: boolean
  remoteBackupEnabled: boolean
  remoteLocation?: string
}

export interface RateLimitSettings {
  enabled: boolean
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  burstLimit: number
  exemptedIPs: string[]
}

export interface MonitoringSettings {
  enabled: boolean
  healthCheckInterval: number // seconds
  alertThresholds: AlertThresholds
  notificationChannels: NotificationChannel[]
  metricsRetentionDays: number
}

export interface AlertThresholds {
  cpuUsagePercent: number
  memoryUsagePercent: number
  diskUsagePercent: number
  responseTimeMs: number
  errorRatePercent: number
}

export interface NotificationChannel {
  id: string
  type: 'EMAIL' | 'SLACK' | 'WEBHOOK' | 'SMS'
  enabled: boolean
  configuration: Record<string, any>
  alertTypes: string[]
}

// Organization/Tenant Management
export interface Organization {
  id: string
  name: string
  slug: string
  status: TenantStatus

  // Contact Information
  contactEmail: string
  contactPhone?: string
  billingEmail?: string

  // Subscription
  subscription: Subscription

  // Configuration
  settings: OrganizationSettings

  // Usage
  usage: OrganizationUsage

  // Limits
  limits: OrganizationLimits

  // Dates
  createdAt: string
  activatedAt?: string
  suspendedAt?: string
  terminatedAt?: string
  lastLoginAt?: string

  // Metadata
  metadata: Record<string, any>
  tags: string[]

  // Support
  supportTier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  supportContact?: string

  createdBy: string
  updatedAt: string
}

export interface Subscription {
  id: string
  organizationId: string

  plan: SubscriptionPlan
  status: SubscriptionStatus

  // Billing
  billingCycle: 'MONTHLY' | 'YEARLY'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialStart?: string
  trialEnd?: string

  // Pricing
  basePrice: number
  discountPercent: number
  totalPrice: number
  currency: string

  // Features
  includedFeatures: string[]
  addOns: SubscriptionAddOn[]

  // Payment
  paymentMethodId?: string
  lastPaymentDate?: string
  nextPaymentDate?: string

  // Lifecycle
  createdAt: string
  activatedAt?: string
  cancelledAt?: string
  expiredAt?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  type: PlanType
  description: string

  // Pricing
  monthlyPrice: number
  yearlyPrice: number
  currency: string

  // Limits
  maxUsers: number
  maxOrganizations: number
  maxStorage: number // GB
  maxApiCalls: number

  // Features
  features: PlanFeature[]

  // Configuration
  isActive: boolean
  isPublic: boolean
  trialDays: number

  createdAt: string
  updatedAt: string
}

export interface PlanFeature {
  id: string
  name: string
  description: string
  included: boolean
  limit?: number
  unlimited: boolean
}

export interface SubscriptionAddOn {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'MONTHLY' | 'YEARLY'
  quantity: number
}

export interface OrganizationSettings {
  timezone: string
  dateFormat: string
  currency: string
  language: string

  // Security
  twoFactorRequired: boolean
  passwordPolicy: PasswordPolicy
  sessionTimeout: number
  ipWhitelist: string[]

  // Features
  enabledFeatures: string[]
  betaFeatures: string[]

  // Integrations
  allowedIntegrations: string[]

  // Branding
  customLogo?: string
  customColors?: {
    primary: string
    secondary: string
    accent: string
  }

  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  webhookUrl?: string
}

export interface OrganizationUsage {
  users: {
    active: number
    total: number
    limit: number
  }
  storage: {
    used: number // MB
    limit: number // MB
  }
  apiCalls: {
    thisMonth: number
    limit: number
  }
  features: Record<string, number>
  lastUpdated: string
}

export interface OrganizationLimits {
  maxUsers: number
  maxStorage: number // MB
  maxApiCallsPerMonth: number
  maxCustomers: number
  maxInvoices: number
  maxQuotes: number
  maxProjects: number
  customLimits: Record<string, number>
}

// System Monitoring
export interface SystemHealth {
  status: SystemStatus
  timestamp: string

  // System Metrics
  cpu: {
    usage: number
    cores: number
    load: number[]
  }
  memory: {
    used: number
    total: number
    usage: number
  }
  disk: {
    used: number
    total: number
    usage: number
  }

  // Application Metrics
  uptime: number
  version: string
  environment: string

  // Database
  database: {
    status: SystemStatus
    connections: number
    maxConnections: number
    responseTime: number
    poolSize: number
  }

  // External Services
  services: ServiceHealth[]

  // Performance
  metrics: PerformanceMetrics
}

export interface ServiceHealth {
  name: string
  status: SystemStatus
  responseTime: number
  lastCheck: string
  endpoint: string
  error?: string
}

export interface PerformanceMetrics {
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  throughput: number

  // Detailed metrics
  httpMetrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
  }

  // Database metrics
  databaseMetrics: {
    totalQueries: number
    averageQueryTime: number
    slowQueries: number
    deadlocks: number
  }
}

// System Logs
export interface SystemLog {
  id: string
  timestamp: string
  level: SystemLogLevel
  message: string
  source: string
  userId?: string
  organizationId?: string

  // Context
  request?: {
    method: string
    url: string
    userAgent: string
    ip: string
    headers: Record<string, string>
  }

  // Error details
  error?: {
    name: string
    message: string
    stack: string
    code?: string
  }

  // Additional data
  metadata: Record<string, any>
}

// Integrations
export interface SystemIntegration {
  id: string
  name: string
  type: IntegrationType
  provider: string
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'

  // Configuration
  configuration: Record<string, any>
  credentials: IntegrationCredentials

  // Usage
  usage: IntegrationUsage

  // Health
  lastHealthCheck: string
  healthStatus: SystemStatus
  errorMessage?: string

  // Metadata
  version: string
  description: string
  documentation: string

  // Lifecycle
  installedAt: string
  lastUsedAt?: string

  organizationId?: string // null for system-wide integrations
  createdBy: string
  updatedAt: string
}

export interface IntegrationCredentials {
  encrypted: boolean
  keys: Record<string, string>
  expiresAt?: string
  refreshToken?: string
}

export interface IntegrationUsage {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  lastCall?: string
  averageResponseTime: number
  quotaUsed: number
  quotaLimit: number
  resetDate?: string
}

// Maintenance
export interface MaintenanceWindow {
  id: string
  title: string
  description: string
  type: MaintenanceType

  // Schedule
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string

  // Status
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

  // Impact
  affectedServices: string[]
  expectedDowntime: number // minutes
  actualDowntime?: number // minutes

  // Communication
  notifyUsers: boolean
  notificationSent: boolean
  notificationMessage: string

  // Tasks
  tasks: MaintenanceTask[]

  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface MaintenanceTask {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  assignedTo?: string
  startedAt?: string
  completedAt?: string
  notes?: string
}

// Analytics
export interface SystemAnalytics {
  period: {
    start: string
    end: string
  }

  // Usage Statistics
  organizations: {
    total: number
    active: number
    new: number
    churned: number
  }

  users: {
    total: number
    active: number
    new: number
  }

  // Performance Statistics
  performance: {
    averageResponseTime: number
    requestVolume: number
    errorRate: number
    uptime: number
  }

  // Feature Usage
  features: FeatureUsageStats[]

  // Revenue (if applicable)
  revenue?: {
    total: number
    recurring: number
    oneTime: number
    currency: string
  }

  // Geographic distribution
  geographic: GeographicStats[]

  // Trends
  trends: {
    userGrowth: TrendData[]
    revenueGrowth: TrendData[]
    usageGrowth: TrendData[]
  }
}

export interface FeatureUsageStats {
  featureName: string
  totalUsers: number
  activeUsers: number
  usageCount: number
  adoptionRate: number
}

export interface GeographicStats {
  country: string
  countryCode: string
  users: number
  organizations: number
  revenue: number
}

export interface TrendData {
  date: string
  value: number
  change: number
  changePercent: number
}

// Filter and search interfaces
export interface OrganizationFilters {
  status?: TenantStatus
  plan?: PlanType
  subscriptionStatus?: SubscriptionStatus
  supportTier?: string
  createdFrom?: string
  createdTo?: string
  lastLoginFrom?: string
  lastLoginTo?: string
  tags?: string[]
  search?: string
}

export interface SystemLogFilters {
  level?: SystemLogLevel
  source?: string
  dateFrom?: string
  dateTo?: string
  userId?: string
  organizationId?: string
  search?: string
}

export interface IntegrationFilters {
  type?: IntegrationType
  status?: string
  provider?: string
  organizationId?: string
  search?: string
}

// Create/Update request interfaces
export interface CreateOrganizationRequest {
  name: string
  slug: string
  contactEmail: string
  contactPhone?: string
  planId: string
  trialDays?: number
  settings?: Partial<OrganizationSettings>
  limits?: Partial<OrganizationLimits>
  metadata?: Record<string, any>
  tags?: string[]
}

export interface UpdateOrganizationRequest {
  name?: string
  contactEmail?: string
  contactPhone?: string
  billingEmail?: string
  status?: TenantStatus
  settings?: Partial<OrganizationSettings>
  limits?: Partial<OrganizationLimits>
  metadata?: Record<string, any>
  tags?: string[]
  supportTier?: string
  supportContact?: string
}

export interface CreateSubscriptionPlanRequest {
  name: string
  type: PlanType
  description: string
  monthlyPrice: number
  yearlyPrice: number
  maxUsers: number
  maxOrganizations: number
  maxStorage: number
  maxApiCalls: number
  features: Omit<PlanFeature, 'id'>[]
  trialDays: number
  isPublic: boolean
}

export interface CreateIntegrationRequest {
  name: string
  type: IntegrationType
  provider: string
  configuration: Record<string, any>
  credentials: Record<string, string>
  description?: string
  organizationId?: string
}

export interface CreateMaintenanceWindowRequest {
  title: string
  description: string
  type: MaintenanceType
  scheduledStart: string
  scheduledEnd: string
  affectedServices: string[]
  notifyUsers: boolean
  notificationMessage?: string
  tasks: Omit<MaintenanceTask, 'id' | 'startedAt' | 'completedAt'>[]
}

export interface UpdateSystemSettingsRequest {
  systemName?: string
  passwordPolicy?: Partial<PasswordPolicy>
  sessionSettings?: Partial<SessionSettings>
  twoFactorRequired?: boolean
  ipWhitelistEnabled?: boolean
  allowedIpRanges?: string[]
  emailSettings?: Partial<EmailSettings>
  storageSettings?: Partial<StorageSettings>
  backupSettings?: Partial<BackupSettings>
  rateLimiting?: Partial<RateLimitSettings>
  monitoringSettings?: Partial<MonitoringSettings>
}

export interface FeatureToggleRequest {
  name: string
  description: string
  enabled: boolean
  rolloutPercentage?: number
  targetTenants?: string[]
  environments?: string[]
}