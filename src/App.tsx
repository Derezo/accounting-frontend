import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { QuotesPage } from '@/pages/quotes/QuotesPage'
import { InvoicesPage } from '@/pages/invoices/InvoicesPage'
import { PaymentsPage } from '@/pages/payments/PaymentsPage'
import { MainLayout } from '@/components/layout/MainLayout'

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
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />

                      {/* Placeholder routes for future implementation */}
                      <Route
                        path="/customers"
                        element={
                          <ProtectedRoute requiredPermission="customers:read">
                            <CustomersPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/quotes"
                        element={
                          <ProtectedRoute requiredPermission="quotes:read">
                            <QuotesPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/invoices"
                        element={
                          <ProtectedRoute requiredPermission="invoices:read">
                            <InvoicesPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/payments"
                        element={
                          <ProtectedRoute requiredPermission="payments:read">
                            <PaymentsPage />
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