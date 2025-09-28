// Customer Lifecycle Management types

export type CustomerLifecycleStage = 'LEAD' | 'PROSPECT' | 'ONBOARDING' | 'ACTIVE' | 'AT_RISK' | 'CHURNED' | 'WON_BACK'
export type CommunicationType = 'EMAIL' | 'PHONE' | 'SMS' | 'IN_PERSON' | 'VIDEO_CALL' | 'CHAT' | 'LETTER'
export type CommunicationDirection = 'INBOUND' | 'OUTBOUND'
export type CommunicationStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'
export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'STALLED' | 'CANCELLED'
export type EngagementLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INACTIVE'
export type CustomerHealthScore = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'
export type EventType = 'MEETING' | 'CALL' | 'EMAIL' | 'MILESTONE' | 'PAYMENT' | 'ISSUE' | 'FEEDBACK' | 'CONTRACT' | 'RENEWAL'

// Customer Lifecycle interfaces
export interface CustomerLifecycle {
  id: string
  customerId: string
  customer?: any // Customer from api.ts

  // Current status
  currentStage: CustomerLifecycleStage
  previousStage?: CustomerLifecycleStage
  stageChangedAt: string
  stageChangedBy: string

  // Health metrics
  healthScore: CustomerHealthScore
  engagementLevel: EngagementLevel
  riskScore: number // 0-100
  churnProbability: number // 0-100

  // Lifecycle metrics
  daysInCurrentStage: number
  daysAsCustomer: number
  lifetimeValue: number
  predictedLifetimeValue: number

  // Key dates
  firstContactDate?: string
  onboardingStartDate?: string
  onboardingCompletedDate?: string
  lastActivityDate?: string
  nextReviewDate?: string

  // Segmentation
  segment?: string
  tags: string[]
  priority: TaskPriority

  // Flags
  isHighValue: boolean
  requiresAttention: boolean
  isAtRisk: boolean

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Customer Communication interfaces
export interface CustomerCommunication {
  id: string
  customerId: string
  customer?: any // Customer from api.ts

  type: CommunicationType
  direction: CommunicationDirection
  status: CommunicationStatus

  // Communication details
  subject: string
  summary?: string
  notes?: string
  outcome?: string

  // Scheduling
  scheduledAt?: string
  completedAt?: string
  duration?: number // in minutes

  // Contact person
  contactPersonName?: string
  contactPersonRole?: string
  participantIds: string[]
  participants?: any[] // User type

  // Follow-up
  requiresFollowUp: boolean
  followUpDate?: string
  followUpNotes?: string

  // Attachments
  attachments: CommunicationAttachment[]

  // Source tracking
  relatedQuoteId?: string
  relatedInvoiceId?: string
  relatedProjectId?: string
  relatedEventId?: string

  // Metadata
  createdBy: string
  createdByUser?: any // User type
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CommunicationAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}

// Customer Onboarding interfaces
export interface CustomerOnboarding {
  id: string
  customerId: string
  customer?: any // Customer from api.ts

  status: OnboardingStatus
  progress: number // 0-100 percentage
  estimatedCompletionDate?: string
  actualCompletionDate?: string

  // Process details
  templateId?: string
  template?: OnboardingTemplate
  steps: OnboardingStep[]
  currentStepIndex: number

  // Assignment
  assignedTo: string
  assignedToUser?: any // User type

  // Timeline
  startedAt?: string
  completedAt?: string
  lastActivityAt?: string

  // Feedback
  customerSatisfactionScore?: number // 1-10
  feedback?: string
  completionNotes?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface OnboardingTemplate {
  id: string
  name: string
  description?: string
  steps: OnboardingTemplateStep[]
  estimatedDuration: number // in days
  isActive: boolean
  organizationId: string
}

export interface OnboardingTemplateStep {
  id: string
  name: string
  description?: string
  orderIndex: number
  estimatedDuration: number // in hours
  isRequired: boolean
  triggerConditions?: string[]
  documents?: string[]
  automationRules?: any
}

export interface OnboardingStep {
  id: string
  templateStepId?: string
  name: string
  description?: string
  orderIndex: number
  status: TaskStatus

  // Timing
  scheduledDate?: string
  startedAt?: string
  completedAt?: string
  dueDate?: string

  // Assignment
  assignedTo?: string
  assignedToUser?: any // User type

  // Completion
  completedBy?: string
  completedByUser?: any // User type
  completionNotes?: string
  attachments: CommunicationAttachment[]

  // Validation
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: string
}

// Customer Portal interfaces
export interface CustomerPortalAccess {
  id: string
  customerId: string
  customer?: any // Customer from api.ts

  // Access control
  isEnabled: boolean
  accessLevel: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'FULL'
  permissions: string[]

  // Credentials
  portalUserId?: string
  portalUsername?: string
  lastLoginAt?: string
  loginCount: number
  failedLoginAttempts: number

  // Features
  canViewInvoices: boolean
  canMakePayments: boolean
  canViewProjects: boolean
  canRequestQuotes: boolean
  canViewDocuments: boolean
  canScheduleAppointments: boolean

  // Customization
  theme?: string
  language?: string
  timezone?: string
  notifications: CustomerPortalNotifications

  // Security
  twoFactorEnabled: boolean
  sessionTimeoutMinutes: number
  ipWhitelist: string[]

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CustomerPortalNotifications {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  invoiceReminders: boolean
  paymentConfirmations: boolean
  projectUpdates: boolean
  systemAnnouncements: boolean
}

// Customer Events & Timeline interfaces
export interface CustomerEvent {
  id: string
  customerId: string
  customer?: any // Customer from api.ts

  type: EventType
  title: string
  description?: string

  // Event details
  eventDate: string
  duration?: number
  location?: string
  isAllDay: boolean

  // Significance
  importance: TaskPriority
  isRecurring: boolean
  recurrencePattern?: string

  // Participants
  organizerUserId: string
  organizerUser?: any // User type
  participantUserIds: string[]
  participantUsers?: any[] // User type
  externalParticipants: string[]

  // Outcomes
  outcome?: string
  actionItems: CustomerActionItem[]
  followUpRequired: boolean
  followUpDate?: string

  // Related records
  relatedCommunicationId?: string
  relatedQuoteId?: string
  relatedInvoiceId?: string
  relatedProjectId?: string

  // Status tracking
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  completedAt?: string
  cancelledReason?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CustomerActionItem {
  id: string
  description: string
  assignedTo?: string
  assignedToUser?: any // User type
  dueDate?: string
  priority: TaskPriority
  status: TaskStatus
  completedAt?: string
  notes?: string
}

// Customer Relationship History interfaces
export interface CustomerRelationshipHistory {
  id: string
  customerId: string
  customer?: any // Customer from api.ts

  // Relationship tracking
  accountManager: string
  accountManagerUser?: any // User type
  relationshipStart: string
  relationshipEnd?: string

  // History summary
  totalProjects: number
  totalRevenue: number
  averageProjectValue: number
  totalInvoices: number
  totalPayments: number
  averagePaymentTime: number

  // Satisfaction tracking
  averageSatisfactionScore: number
  totalFeedbackReceived: number
  netPromoterScore?: number

  // Milestones
  milestones: CustomerMilestone[]

  // Performance metrics
  onTimeDeliveryRate: number
  customerRetentionMonths: number
  upsellSuccessRate: number

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CustomerMilestone {
  id: string
  type: 'FIRST_PROJECT' | 'FIRST_PAYMENT' | 'CONTRACT_RENEWAL' | 'MAJOR_PROJECT' | 'REFERRAL' | 'COMPLAINT_RESOLVED' | 'LOYALTY_MILESTONE'
  title: string
  description?: string
  achievedDate: string
  value?: number
  significance: 'LOW' | 'MEDIUM' | 'HIGH'
}

// Customer Analytics & Insights interfaces
export interface CustomerInsights {
  customerId: string
  customer?: any // Customer from api.ts

  // Behavioral insights
  communicationPreferences: {
    preferredChannel: CommunicationType
    bestTimeToContact: string
    responseRate: number
    averageResponseTime: number // in hours
  }

  // Financial insights
  paymentBehavior: {
    averagePaymentTime: number // in days
    earlyPaymentRate: number
    latePaymentRate: number
    preferredPaymentMethod: string
    creditUtilization: number
  }

  // Engagement insights
  engagementMetrics: {
    totalInteractions: number
    lastInteractionDate: string
    interactionFrequency: number // per month
    portalUsage: {
      loginFrequency: number
      featuresUsed: string[]
      averageSessionDuration: number
    }
  }

  // Risk assessment
  riskFactors: CustomerRiskFactor[]
  opportunityFactors: CustomerOpportunityFactor[]

  // Predictions
  predictions: {
    churnProbability: number
    nextPurchaseProbability: number
    lifetimeValuePrediction: number
    optimalContactTime: string
  }

  // Recommendations
  recommendations: CustomerRecommendation[]

  lastUpdated: string
}

export interface CustomerRiskFactor {
  factor: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  recommendation?: string
}

export interface CustomerOpportunityFactor {
  factor: string
  potential: 'LOW' | 'MEDIUM' | 'HIGH'
  description: string
  suggestedAction?: string
}

export interface CustomerRecommendation {
  type: 'ENGAGEMENT' | 'RETENTION' | 'UPSELL' | 'COMMUNICATION' | 'SUPPORT'
  title: string
  description: string
  priority: TaskPriority
  estimatedImpact: 'LOW' | 'MEDIUM' | 'HIGH'
  suggestedActions: string[]
}

// Customer Segmentation interfaces
export interface CustomerSegment {
  id: string
  name: string
  description?: string
  criteria: SegmentCriteria
  customerCount: number
  isActive: boolean
  isAutoUpdated: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface SegmentCriteria {
  rules: SegmentRule[]
  logic: 'AND' | 'OR'
}

export interface SegmentRule {
  field: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'NOT_CONTAINS' | 'IN' | 'NOT_IN'
  value: any
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ARRAY'
}

// Filter and search interfaces
export interface CustomerLifecycleFilters {
  stage?: CustomerLifecycleStage
  healthScore?: CustomerHealthScore
  engagementLevel?: EngagementLevel
  isAtRisk?: boolean
  requiresAttention?: boolean
  segment?: string
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface CommunicationFilters {
  customerId?: string
  type?: CommunicationType
  direction?: CommunicationDirection
  status?: CommunicationStatus
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface OnboardingFilters {
  status?: OnboardingStatus
  assignedTo?: string
  templateId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Create/Update request interfaces
export interface CreateCommunicationRequest {
  customerId: string
  type: CommunicationType
  direction: CommunicationDirection
  subject: string
  summary?: string
  notes?: string
  scheduledAt?: string
  contactPersonName?: string
  contactPersonRole?: string
  requiresFollowUp?: boolean
  followUpDate?: string
}

export interface CreateOnboardingRequest {
  customerId: string
  templateId?: string
  assignedTo: string
  estimatedCompletionDate?: string
  customSteps?: Omit<OnboardingTemplateStep, 'id'>[]
}

export interface CreateCustomerEventRequest {
  customerId: string
  type: EventType
  title: string
  description?: string
  eventDate: string
  duration?: number
  location?: string
  isAllDay?: boolean
  importance?: TaskPriority
  participantUserIds?: string[]
  externalParticipants?: string[]
}

export interface UpdateCustomerLifecycleRequest {
  stage?: CustomerLifecycleStage
  healthScore?: CustomerHealthScore
  engagementLevel?: EngagementLevel
  riskScore?: number
  segment?: string
  tags?: string[]
  priority?: TaskPriority
  nextReviewDate?: string
  requiresAttention?: boolean
}

export interface UpdatePortalAccessRequest {
  isEnabled?: boolean
  accessLevel?: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'FULL'
  permissions?: string[]
  canViewInvoices?: boolean
  canMakePayments?: boolean
  canViewProjects?: boolean
  canRequestQuotes?: boolean
  canViewDocuments?: boolean
  canScheduleAppointments?: boolean
  notifications?: Partial<CustomerPortalNotifications>
  twoFactorEnabled?: boolean
}