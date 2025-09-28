// Employee and Contractor Management types

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE' | 'PENDING'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY'
export type ContractorStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'PENDING'
export type ContractType = 'FIXED_TERM' | 'PROJECT_BASED' | 'HOURLY' | 'RETAINER'
export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'PROJECT_END'
export type LeaveType = 'VACATION' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY' | 'MEDICAL' | 'BEREAVEMENT'
export type ReviewPeriod = 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL'
export type PerformanceRating = 'EXCEEDS' | 'MEETS' | 'BELOW' | 'UNSATISFACTORY'

// Employee interfaces
export interface Employee {
  id: string
  employeeId: string // Unique employee identifier

  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  socialSecurityNumber?: string // Encrypted

  // Address
  addresses: EmployeeAddress[]

  // Employment Details
  status: EmployeeStatus
  employmentType: EmploymentType
  department?: string
  position: string
  reportsTo?: string // Manager's employee ID
  reportsToEmployee?: Employee

  // Dates
  hireDate: string
  startDate: string
  terminationDate?: string
  probationEndDate?: string

  // Compensation
  salary?: number
  hourlyRate?: number
  currency: string
  payrollSchedule: PaymentFrequency

  // Benefits and Time Off
  annualVacationDays: number
  remainingVacationDays: number
  sickDaysAllowance: number
  remainingSickDays: number
  benefitsEligible: boolean

  // Work Information
  workLocation?: string
  remotePolicyId?: string
  workSchedule?: WorkSchedule

  // System Access
  userId?: string // Reference to User in auth system
  user?: any // User type from auth.ts
  accessLevel: string
  permissions: string[]

  // Documents and Files
  documents: EmployeeDocument[]

  // Emergency Contact
  emergencyContacts: EmergencyContact[]

  // Performance and Reviews
  lastReviewDate?: string
  nextReviewDate?: string
  currentPerformanceRating?: PerformanceRating

  // Flags
  isManager: boolean
  isActive: boolean
  requiresBackground: boolean
  backgroundCheckCompleted: boolean

  organizationId: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface EmployeeAddress {
  id: string
  type: 'HOME' | 'MAILING' | 'WORK'
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isPrimary: boolean
}

export interface WorkSchedule {
  id: string
  name: string
  hoursPerWeek: number
  schedule: DaySchedule[]
  isFlexible: boolean
  coreHours?: {
    start: string
    end: string
  }
}

export interface DaySchedule {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  isWorkDay: boolean
  startTime?: string
  endTime?: string
  breakDuration?: number // minutes
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  isPrimary: boolean
}

export interface EmployeeDocument {
  id: string
  name: string
  type: 'CONTRACT' | 'ID_COPY' | 'RESUME' | 'CERTIFICATION' | 'REVIEW' | 'POLICY' | 'OTHER'
  filename: string
  url: string
  uploadedAt: string
  uploadedBy: string
  expirationDate?: string
  isRequired: boolean
  isConfidential: boolean
}

// Contractor interfaces
export interface Contractor {
  id: string
  contractorId: string // Unique contractor identifier

  // Personal/Business Information
  isIndividual: boolean
  firstName?: string // For individuals
  lastName?: string // For individuals
  businessName?: string // For companies
  email: string
  phone?: string
  taxId?: string // SSN for individuals, EIN for businesses

  // Address
  addresses: EmployeeAddress[]

  // Contract Details
  status: ContractorStatus
  contractType: ContractType
  contracts: Contract[]
  currentContractId?: string

  // Payment Information
  defaultRate?: number
  defaultRateType: 'HOURLY' | 'DAILY' | 'PROJECT' | 'RETAINER'
  currency: string
  paymentTerms: string // e.g., "Net 30"
  paymentFrequency: PaymentFrequency

  // Skills and Expertise
  skills: string[]
  certifications: Certification[]
  specializations: string[]

  // Work Information
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
  preferredWorkType: 'REMOTE' | 'ONSITE' | 'HYBRID'
  timezone?: string

  // Performance and History
  totalProjectsCompleted: number
  averageRating: number
  totalEarnings: number

  // Documents
  documents: EmployeeDocument[]

  // Compliance
  w9OnFile: boolean
  insuranceRequired: boolean
  insuranceCertificateOnFile: boolean
  ndaOnFile: boolean

  organizationId: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Contract {
  id: string
  contractorId: string
  contractor?: Contractor

  // Contract Details
  contractNumber: string
  title: string
  description?: string
  type: ContractType
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED'

  // Timeline
  startDate: string
  endDate?: string
  expectedCompletionDate?: string
  actualCompletionDate?: string

  // Financial Terms
  totalValue?: number
  rate?: number
  rateType: 'HOURLY' | 'DAILY' | 'PROJECT' | 'RETAINER'
  currency: string
  paymentTerms: string
  invoicingFrequency: PaymentFrequency

  // Work Scope
  scope: string
  deliverables: Deliverable[]
  milestones: ContractMilestone[]

  // Project Association
  projectIds: string[]
  projects?: any[] // Project type from projects

  // Performance
  hoursWorked: number
  amountInvoiced: number
  amountPaid: number

  // Terms and Conditions
  terms: string
  cancellationTerms?: string
  renewalTerms?: string

  // Compliance and Legal
  backgroundCheckRequired: boolean
  backgroundCheckCompleted: boolean
  ndaRequired: boolean
  ndaSigned: boolean
  insuranceRequired: boolean

  // Documents
  documents: EmployeeDocument[]

  organizationId: string
  createdAt: string
  updatedAt: string
  createdBy: string
  approvedBy?: string
  approvedAt?: string
}

export interface Deliverable {
  id: string
  name: string
  description?: string
  dueDate?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  completedDate?: string
  notes?: string
}

export interface ContractMilestone {
  id: string
  name: string
  description?: string
  targetDate: string
  completedDate?: string
  paymentAmount?: number
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  notes?: string
}

export interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  expirationDate?: string
  credentialId?: string
  isActive: boolean
}

// Time tracking interfaces
export interface TimeEntry {
  id: string
  employeeId?: string
  contractorId?: string
  employee?: Employee
  contractor?: Contractor

  // Time details
  date: string
  startTime: string
  endTime?: string
  totalHours: number
  breakDuration?: number // minutes

  // Work description
  description: string
  projectId?: string
  project?: any // Project type
  taskId?: string
  taskDescription?: string

  // Classification
  type: 'REGULAR' | 'OVERTIME' | 'HOLIDAY' | 'SICK' | 'VACATION' | 'TRAINING'
  isBillable: boolean
  rate?: number

  // Approval workflow
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string

  // Invoicing
  invoiceId?: string
  isInvoiced: boolean
  invoicedAt?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Leave management interfaces
export interface LeaveRequest {
  id: string
  employeeId: string
  employee?: Employee

  // Leave details
  type: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  isFullDay: boolean
  startTimePartial?: string
  endTimePartial?: string

  // Request details
  reason?: string
  notes?: string
  attachments: EmployeeDocument[]

  // Approval workflow
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string

  // Impact
  coveringEmployeeId?: string
  coveringEmployee?: Employee
  workImpact?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Performance management interfaces
export interface PerformanceReview {
  id: string
  employeeId: string
  employee?: Employee

  // Review details
  reviewPeriod: ReviewPeriod
  reviewYear: number
  startDate: string
  endDate: string

  // Participants
  reviewerId: string
  reviewer?: Employee
  selfReviewCompleted: boolean
  peerReviewers: string[]

  // Content
  goals: ReviewGoal[]
  competencies: CompetencyReview[]
  achievements: string[]
  areasForImprovement: string[]
  developmentPlan: string[]

  // Ratings
  overallRating: PerformanceRating
  goalAchievementRating: PerformanceRating
  competencyRating: PerformanceRating

  // Comments
  employeeComments?: string
  managerComments?: string
  hrComments?: string

  // Outcomes
  salaryRecommendation?: number
  promotionRecommended: boolean
  trainingRecommendations: string[]

  // Status
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ACKNOWLEDGED'
  completedAt?: string
  acknowledgedAt?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface ReviewGoal {
  id: string
  description: string
  targetDate?: string
  weight: number // percentage
  achievement: number // 0-100%
  rating: PerformanceRating
  comments?: string
}

export interface CompetencyReview {
  id: string
  competencyName: string
  description: string
  rating: PerformanceRating
  comments?: string
  developmentNeeded: boolean
}

// Payroll interfaces
export interface PayrollPeriod {
  id: string
  periodStart: string
  periodEnd: string
  payDate: string
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'PAID'

  // Totals
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  totalEmployees: number

  organizationId: string
  createdAt: string
  updatedAt: string
  processedBy?: string
}

export interface PayrollEntry {
  id: string
  payrollPeriodId: string
  employeeId: string
  employee?: Employee

  // Hours and earnings
  regularHours: number
  overtimeHours: number
  holidayHours: number
  sickHours: number
  vacationHours: number

  // Pay calculations
  regularPay: number
  overtimePay: number
  holidayPay: number
  bonuses: number
  commissions: number
  grossPay: number

  // Deductions
  federalTax: number
  stateTax: number
  socialSecurity: number
  medicare: number
  healthInsurance: number
  retirement401k: number
  otherDeductions: number
  totalDeductions: number

  // Net pay
  netPay: number

  // Status
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Filter and search interfaces
export interface EmployeeFilters {
  status?: EmployeeStatus
  employmentType?: EmploymentType
  department?: string
  position?: string
  reportsTo?: string
  isManager?: boolean
  search?: string
}

export interface ContractorFilters {
  status?: ContractorStatus
  contractType?: ContractType
  skills?: string[]
  availabilityStatus?: string
  search?: string
}

export interface TimeEntryFilters {
  employeeId?: string
  contractorId?: string
  projectId?: string
  dateFrom?: string
  dateTo?: string
  type?: string
  status?: string
  isBillable?: boolean
  search?: string
}

export interface LeaveRequestFilters {
  employeeId?: string
  type?: LeaveType
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Create/Update request interfaces
export interface CreateEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  employmentType: EmploymentType
  department?: string
  position: string
  reportsTo?: string
  hireDate: string
  startDate: string
  salary?: number
  hourlyRate?: number
  payrollSchedule: PaymentFrequency
  workLocation?: string
  isManager?: boolean
}

export interface UpdateEmployeeRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  status?: EmployeeStatus
  employmentType?: EmploymentType
  department?: string
  position?: string
  reportsTo?: string
  salary?: number
  hourlyRate?: number
  payrollSchedule?: PaymentFrequency
  workLocation?: string
  isManager?: boolean
}

export interface CreateContractorRequest {
  isIndividual: boolean
  firstName?: string
  lastName?: string
  businessName?: string
  email: string
  phone?: string
  contractType: ContractType
  defaultRate?: number
  defaultRateType: 'HOURLY' | 'DAILY' | 'PROJECT' | 'RETAINER'
  paymentTerms: string
  skills?: string[]
  specializations?: string[]
}

export interface CreateContractRequest {
  contractorId: string
  title: string
  description?: string
  type: ContractType
  startDate: string
  endDate?: string
  totalValue?: number
  rate?: number
  rateType: 'HOURLY' | 'DAILY' | 'PROJECT' | 'RETAINER'
  paymentTerms: string
  scope: string
  projectIds?: string[]
}

export interface CreateTimeEntryRequest {
  employeeId?: string
  contractorId?: string
  date: string
  startTime: string
  endTime?: string
  totalHours: number
  description: string
  projectId?: string
  taskDescription?: string
  type: 'REGULAR' | 'OVERTIME' | 'HOLIDAY' | 'SICK' | 'VACATION' | 'TRAINING'
  isBillable: boolean
  rate?: number
}

export interface CreateLeaveRequestRequest {
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  isFullDay: boolean
  startTimePartial?: string
  endTimePartial?: string
  reason?: string
  notes?: string
}

export interface CreatePerformanceReviewRequest {
  employeeId: string
  reviewPeriod: ReviewPeriod
  reviewYear: number
  startDate: string
  endDate: string
  reviewerId: string
  goals: Omit<ReviewGoal, 'id'>[]
  competencies: Omit<CompetencyReview, 'id'>[]
}