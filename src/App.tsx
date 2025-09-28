import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/auth.store'

import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { QuotesPage } from '@/pages/quotes/QuotesPage'
import { InvoicesPage } from '@/pages/invoices/InvoicesPage'
import { InvoicePDFPage } from '@/pages/invoices/InvoicePDFPage'
import { PaymentsPage } from '@/pages/payments/PaymentsPage'
import { PaymentPage } from '@/pages/payments/PaymentPage'
import { ETransferPage } from '@/pages/payments/ETransferPage'
import { ManualPaymentPage } from '@/pages/payments/ManualPaymentPage'
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { OrganizationSettingsPage } from '@/pages/admin/OrganizationSettingsPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import AdvancedAnalyticsPage from '@/pages/analytics/AdvancedAnalyticsPage'
import PerformanceMetricsPage from '@/pages/analytics/PerformanceMetricsPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { UserManagementPage } from '@/pages/admin/UserManagementPage'
import { AuditTrailPage } from '@/pages/admin/AuditTrailPage'
import AuditPage from '@/pages/audit/AuditPage'
import { CurrencySettingsPage } from '@/pages/settings/CurrencySettingsPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { PasswordResetPage } from '@/pages/auth/PasswordResetPage'
import { NewPasswordPage } from '@/pages/auth/NewPasswordPage'
import { EmailVerificationPage } from '@/pages/auth/EmailVerificationPage'
import { ChartOfAccountsPage } from '@/pages/accounting/ChartOfAccountsPage'
import { JournalEntriesPage } from '@/pages/accounting/JournalEntriesPage'
import { BankReconciliationPage } from '@/pages/accounting/BankReconciliationPage'
import { FinancialStatementsPage } from '@/pages/accounting/FinancialStatementsPage'
import { ExpensesPage } from '@/pages/expenses/ExpensesPage'
import { TaxManagementPage } from '@/pages/tax/TaxManagementPage'
import { MainLayout } from '@/components/layout/MainLayout'
import Index from '@/pages/Index'
import { Dashboard } from '@/components/Dashboard'
import { CustomerManagement } from '@/components/CustomerManagement'
import { CustomerLifecyclePage } from '@/pages/customers/CustomerLifecyclePage'
import { EmployeesPage } from '@/pages/employees/EmployeesPage'
import { SystemAdminPage } from '@/pages/admin/SystemAdminPage'
import { FinancialAnalysisPage } from '@/pages/analytics/FinancialAnalysisPage'
import { PaymentProcessingPage } from '@/pages/payments/PaymentProcessingPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  // Initialize authentication only once at app level
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Index />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Auth routes */}
            <Route path="/auth/password-reset" element={<PasswordResetPage />} />
            <Route path="/auth/new-password" element={<NewPasswordPage />} />
            <Route path="/auth/email-verification" element={<EmailVerificationPage />} />

            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      {/* Dashboard Routes */}
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/dashboard-new" element={<Dashboard />} />

                      {/* Customer Management */}
                      <Route
                        path="/customers"
                        element={
                          <ProtectedRoute requiredPermission="customers:read">
                            <CustomersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customers-new"
                        element={
                          <ProtectedRoute requiredPermission="customers:read">
                            <CustomerManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customers/lifecycle"
                        element={
                          <ProtectedRoute requiredPermission="customers:read">
                            <CustomerLifecyclePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Quote Management */}
                      <Route
                        path="/quotes"
                        element={
                          <ProtectedRoute requiredPermission="quotes:read">
                            <QuotesPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Invoice Management */}
                      <Route
                        path="/invoices"
                        element={
                          <ProtectedRoute requiredPermission="invoices:read">
                            <InvoicesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invoices/:id/pdf"
                        element={
                          <ProtectedRoute requiredPermission="invoices:read">
                            <InvoicePDFPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Payment Management */}
                      <Route
                        path="/payments"
                        element={
                          <ProtectedRoute requiredPermission="payments:read">
                            <PaymentsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/payments/:id"
                        element={
                          <ProtectedRoute requiredPermission="payments:read">
                            <PaymentPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/payment-processing"
                        element={
                          <ProtectedRoute requiredPermission="payments:admin">
                            <PaymentProcessingPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Project Management - Manager+ */}
                      <Route
                        path="/projects"
                        element={
                          <ProtectedRoute requiredPermission="projects:read">
                            <ProjectsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Employee Management - Manager+ */}
                      <Route
                        path="/employees"
                        element={
                          <ProtectedRoute requiredPermission="employees:read">
                            <EmployeesPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Appointment Management - Employee+ */}
                      <Route
                        path="/appointments"
                        element={
                          <ProtectedRoute requiredPermission="appointments:read">
                            <AppointmentsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Analytics & Reports - Accountant+ */}
                      <Route
                        path="/analytics"
                        element={
                          <ProtectedRoute requiredPermission="analytics:read">
                            <AnalyticsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/advanced-analytics"
                        element={
                          <ProtectedRoute requiredPermission="analytics:read">
                            <AdvancedAnalyticsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/performance-metrics"
                        element={
                          <ProtectedRoute requiredPermission="analytics:read">
                            <PerformanceMetricsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/financial-analysis"
                        element={
                          <ProtectedRoute requiredPermission="accounting:read">
                            <FinancialAnalysisPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute requiredPermission="reports:read">
                            <ReportsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Payment Processing - Accountant Only */}
                      <Route
                        path="/etransfer"
                        element={
                          <ProtectedRoute requiredPermission="etransfer:read">
                            <ETransferPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/manual-payments"
                        element={
                          <ProtectedRoute requiredPermission="manual-payment:read">
                            <ManualPaymentPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Notifications - Employee+ */}
                      <Route
                        path="/notifications"
                        element={
                          <ProtectedRoute requiredPermission="notifications:read">
                            <NotificationsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Audit - Accountant+ */}
                      <Route
                        path="/audit"
                        element={
                          <ProtectedRoute requiredPermission="audit:read">
                            <AuditPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Accounting - Accountant+ */}
                      <Route
                        path="/accounting/chart-of-accounts"
                        element={
                          <ProtectedRoute requiredPermission="accounting:read">
                            <ChartOfAccountsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/accounting/journal-entries"
                        element={
                          <ProtectedRoute requiredPermission="accounting:write">
                            <JournalEntriesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/accounting/bank-reconciliation"
                        element={
                          <ProtectedRoute requiredPermission="accounting:write">
                            <BankReconciliationPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/accounting/financial-statements"
                        element={
                          <ProtectedRoute requiredPermission="accounting:read">
                            <FinancialStatementsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Expense Management - Employee+ */}
                      <Route
                        path="/expenses"
                        element={
                          <ProtectedRoute requiredPermission="expenses:read">
                            <ExpensesPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Tax Management - Accountant+ */}
                      <Route
                        path="/tax"
                        element={
                          <ProtectedRoute requiredPermission="tax:read">
                            <TaxManagementPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Settings */}
                      <Route
                        path="/settings/currency"
                        element={
                          <ProtectedRoute requiredPermission="settings:read">
                            <CurrencySettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes - Admin+ */}
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedRoute requiredPermission="users:read">
                            <UserManagementPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/admin/organization"
                        element={
                          <ProtectedRoute requiredPermission="organization:read">
                            <OrganizationSettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/admin/audit"
                        element={
                          <ProtectedRoute requiredPermission="audit:read">
                            <AuditTrailPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* System Administration - SUPER_ADMIN Only */}
                      <Route
                        path="/admin/system"
                        element={
                          <ProtectedRoute requiredPermission="system:admin">
                            <SystemAdminPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Default redirect */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />

                      {/* 404 */}
                      <Route
                        path="*"
                        element={
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">Page Not Found</h1>
                            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                          </div>
                        }
                      />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </Router>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App