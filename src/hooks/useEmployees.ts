import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import {
  Employee,
  Contractor,
  Contract,
  TimeEntry,
  LeaveRequest,
  PerformanceReview,
  PayrollPeriod,
  PayrollEntry,
  WorkSchedule,
  EmployeeFilters,
  ContractorFilters,
  TimeEntryFilters,
  LeaveRequestFilters,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateContractorRequest,
  CreateContractRequest,
  CreateTimeEntryRequest,
  CreateLeaveRequestRequest,
  CreatePerformanceReviewRequest
} from '@/types/employees'

// Query Keys
export const employeeQueryKeys = {
  all: ['employees'] as const,
  employees: (filters?: EmployeeFilters) => [...employeeQueryKeys.all, 'list', filters] as const,
  employee: (id: string) => [...employeeQueryKeys.all, 'detail', id] as const,
  contractors: (filters?: ContractorFilters) => [...employeeQueryKeys.all, 'contractors', filters] as const,
  contractor: (id: string) => [...employeeQueryKeys.all, 'contractor', id] as const,
  contracts: (contractorId?: string) => [...employeeQueryKeys.all, 'contracts', contractorId] as const,
  contract: (id: string) => [...employeeQueryKeys.all, 'contract', id] as const,
  timeEntries: (filters?: TimeEntryFilters) => [...employeeQueryKeys.all, 'time-entries', filters] as const,
  timeEntry: (id: string) => [...employeeQueryKeys.all, 'time-entry', id] as const,
  leaveRequests: (filters?: LeaveRequestFilters) => [...employeeQueryKeys.all, 'leave-requests', filters] as const,
  leaveRequest: (id: string) => [...employeeQueryKeys.all, 'leave-request', id] as const,
  performanceReviews: (employeeId?: string) => [...employeeQueryKeys.all, 'performance-reviews', employeeId] as const,
  performanceReview: (id: string) => [...employeeQueryKeys.all, 'performance-review', id] as const,
  payrollPeriods: () => [...employeeQueryKeys.all, 'payroll-periods'] as const,
  payrollPeriod: (id: string) => [...employeeQueryKeys.all, 'payroll-period', id] as const,
  payrollEntries: (periodId: string) => [...employeeQueryKeys.all, 'payroll-entries', periodId] as const,
  workSchedules: () => [...employeeQueryKeys.all, 'work-schedules'] as const,
  workSchedule: (id: string) => [...employeeQueryKeys.all, 'work-schedule', id] as const,
  employeeHierarchy: () => [...employeeQueryKeys.all, 'hierarchy'] as const,
  employeeAnalytics: (filters?: any) => [...employeeQueryKeys.all, 'analytics', filters] as const,
}

// Employee hooks
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: employeeQueryKeys.employees(filters),
    queryFn: () => apiService.getEmployees(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.employee(id),
    queryFn: () => apiService.getEmployee(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => apiService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employeeHierarchy() })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      apiService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employee(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employeeHierarchy() })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employeeHierarchy() })
    },
  })
}

// Contractor hooks
export function useContractors(filters?: ContractorFilters) {
  return useQuery({
    queryKey: employeeQueryKeys.contractors(filters),
    queryFn: () => apiService.getContractors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useContractor(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.contractor(id),
    queryFn: () => apiService.getContractor(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateContractor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContractorRequest) => apiService.createContractor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contractors() })
    },
  })
}

export function useUpdateContractor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateContractorRequest> }) =>
      apiService.updateContractor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contractor(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contractors() })
    },
  })
}

export function useDeleteContractor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteContractor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contractors() })
    },
  })
}

// Contract hooks
export function useContracts(contractorId?: string) {
  return useQuery({
    queryKey: employeeQueryKeys.contracts(contractorId),
    queryFn: () => apiService.getContracts(contractorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.contract(id),
    queryFn: () => apiService.getContract(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContractRequest) => apiService.createContract(data),
    onSuccess: (newContract) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contracts() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contractor(newContract.contractorId) })
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateContractRequest> }) =>
      apiService.updateContract(id, data),
    onSuccess: (updatedContract, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contract(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contracts() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contractor(updatedContract.contractorId) })
    },
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.contracts() })
    },
  })
}

// Time tracking hooks
export function useTimeEntries(filters?: TimeEntryFilters) {
  return useQuery({
    queryKey: employeeQueryKeys.timeEntries(filters),
    queryFn: () => apiService.getTimeEntries(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useTimeEntry(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.timeEntry(id),
    queryFn: () => apiService.getTimeEntry(id),
    enabled: !!id,
  })
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTimeEntryRequest) => apiService.createTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntries() })
    },
  })
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTimeEntryRequest> }) =>
      apiService.updateTimeEntry(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntry(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntries() })
    },
  })
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntries() })
    },
  })
}

export function useSubmitTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.submitTimeEntry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntry(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntries() })
    },
  })
}

export function useApproveTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiService.approveTimeEntry(id, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntry(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntries() })
    },
  })
}

export function useRejectTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.rejectTimeEntry(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntry(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntries() })
    },
  })
}

// Leave management hooks
export function useLeaveRequests(filters?: LeaveRequestFilters) {
  return useQuery({
    queryKey: employeeQueryKeys.leaveRequests(filters),
    queryFn: () => apiService.getLeaveRequests(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.leaveRequest(id),
    queryFn: () => apiService.getLeaveRequest(id),
    enabled: !!id,
  })
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaveRequestRequest) => apiService.createLeaveRequest(data),
    onSuccess: (newRequest) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequests() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employee(newRequest.employeeId) })
    },
  })
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeaveRequestRequest> }) =>
      apiService.updateLeaveRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequest(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequests() })
    },
  })
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiService.approveLeaveRequest(id, notes),
    onSuccess: (updatedRequest, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequest(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequests() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employee(updatedRequest.employeeId) })
    },
  })
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.rejectLeaveRequest(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequest(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequests() })
    },
  })
}

// Performance review hooks
export function usePerformanceReviews(employeeId?: string) {
  return useQuery({
    queryKey: employeeQueryKeys.performanceReviews(employeeId),
    queryFn: () => apiService.getPerformanceReviews(employeeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function usePerformanceReview(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.performanceReview(id),
    queryFn: () => apiService.getPerformanceReview(id),
    enabled: !!id,
  })
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePerformanceReviewRequest) => apiService.createPerformanceReview(data),
    onSuccess: (newReview) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.performanceReviews() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employee(newReview.employeeId) })
    },
  })
}

export function useUpdatePerformanceReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePerformanceReviewRequest> }) =>
      apiService.updatePerformanceReview(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.performanceReview(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.performanceReviews() })
    },
  })
}

export function useCompletePerformanceReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.completePerformanceReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.performanceReview(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.performanceReviews() })
    },
  })
}

// Payroll hooks
export function usePayrollPeriods() {
  return useQuery({
    queryKey: employeeQueryKeys.payrollPeriods(),
    queryFn: () => apiService.getPayrollPeriods(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function usePayrollPeriod(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.payrollPeriod(id),
    queryFn: () => apiService.getPayrollPeriod(id),
    enabled: !!id,
  })
}

export function usePayrollEntries(periodId: string) {
  return useQuery({
    queryKey: employeeQueryKeys.payrollEntries(periodId),
    queryFn: () => apiService.getPayrollEntries(periodId),
    enabled: !!periodId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreatePayrollPeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { periodStart: string; periodEnd: string; payDate: string }) =>
      apiService.createPayrollPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.payrollPeriods() })
    },
  })
}

export function useProcessPayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (periodId: string) => apiService.processPayroll(periodId),
    onSuccess: (_, periodId) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.payrollPeriod(periodId) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.payrollEntries(periodId) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.payrollPeriods() })
    },
  })
}

// Work schedule hooks
export function useWorkSchedules() {
  return useQuery({
    queryKey: employeeQueryKeys.workSchedules(),
    queryFn: () => apiService.getWorkSchedules(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useWorkSchedule(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.workSchedule(id),
    queryFn: () => apiService.getWorkSchedule(id),
    enabled: !!id,
  })
}

export function useCreateWorkSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<WorkSchedule, 'id'>) => apiService.createWorkSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.workSchedules() })
    },
  })
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkSchedule> }) =>
      apiService.updateWorkSchedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.workSchedule(id) })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.workSchedules() })
    },
  })
}

// Analytics and reporting hooks
export function useEmployeeHierarchy() {
  return useQuery({
    queryKey: employeeQueryKeys.employeeHierarchy(),
    queryFn: () => apiService.getEmployeeHierarchy(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useEmployeeAnalytics(filters?: any) {
  return useQuery({
    queryKey: employeeQueryKeys.employeeAnalytics(filters),
    queryFn: () => apiService.getEmployeeAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Bulk operations
export function useBulkUpdateEmployees() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeIds, data }: { employeeIds: string[]; data: Partial<UpdateEmployeeRequest> }) =>
      apiService.bulkUpdateEmployees(employeeIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employees() })
    },
  })
}

export function useBulkApproveTimeEntries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ timeEntryIds, notes }: { timeEntryIds: string[]; notes?: string }) =>
      apiService.bulkApproveTimeEntries(timeEntryIds, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.timeEntries() })
    },
  })
}

export function useBulkApproveLeaveRequests() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leaveRequestIds, notes }: { leaveRequestIds: string[]; notes?: string }) =>
      apiService.bulkApproveLeaveRequests(leaveRequestIds, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.leaveRequests() })
    },
  })
}

// File upload hooks
export function useUploadEmployeeDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeId, file, type }: { employeeId: string; file: File; type: string }) =>
      apiService.uploadEmployeeDocument(employeeId, file, type),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employee(employeeId) })
    },
  })
}

export function useDeleteEmployeeDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeId, documentId }: { employeeId: string; documentId: string }) =>
      apiService.deleteEmployeeDocument(employeeId, documentId),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.employee(employeeId) })
    },
  })
}

// Export hooks
export function useExportEmployeeData() {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'PDF' | 'EXCEL' | 'CSV'; filters?: EmployeeFilters }) =>
      apiService.exportEmployeeData(format, filters),
  })
}

export function useExportTimeEntries() {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'PDF' | 'EXCEL' | 'CSV'; filters?: TimeEntryFilters }) =>
      apiService.exportTimeEntries(format, filters),
  })
}

export function useExportPayrollReport() {
  return useMutation({
    mutationFn: ({ periodId, format }: { periodId: string; format: 'PDF' | 'EXCEL' | 'CSV' }) =>
      apiService.exportPayrollReport(periodId, format),
  })
}