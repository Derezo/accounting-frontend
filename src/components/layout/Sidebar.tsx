import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  X,
  FolderOpen,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  DollarSign,
  Banknote,
  UserCog,
  Building,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation organized by functional areas and role access
const navigation = [
  // Core Operations (All Users)
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'customers:read', // Everyone with access can see dashboard
  },

  // Customer Lifecycle Management
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    permission: 'customers:read',
  },
  {
    name: 'Quotes',
    href: '/quotes',
    icon: FileText,
    permission: 'quotes:read',
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    permission: 'appointments:read',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    permission: 'projects:read',
  },

  // Financial Operations
  {
    name: 'Invoices',
    href: '/invoices',
    icon: Receipt,
    permission: 'invoices:read',
  },
  {
    name: 'Payments',
    href: '/payments',
    icon: CreditCard,
    permission: 'payments:read',
  },

  // Accountant-Specific Tools
  {
    name: 'e-Transfer',
    href: '/etransfer',
    icon: DollarSign,
    permission: 'etransfer:read',
  },
  {
    name: 'Manual Payments',
    href: '/manual-payments',
    icon: Banknote,
    permission: 'manual-payment:read',
  },

  // Analytics & Reporting
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'analytics:read',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileSpreadsheet,
    permission: 'reports:read',
  },

  // Administration (Admin+)
  {
    name: 'Users',
    href: '/admin/users',
    icon: UserCog,
    permission: 'users:read',
  },
  {
    name: 'Organization',
    href: '/admin/organization',
    icon: Building,
    permission: 'organization:read',
  },
  {
    name: 'Audit Trail',
    href: '/admin/audit',
    icon: Shield,
    permission: 'audit:read',
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { canAccess } = useAuth()

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter(item =>
    canAccess(item.permission.split(':')[0], item.permission.split(':')[1] as 'read' | 'write' | 'delete')
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-background">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-primary">
              Accounting Pro
            </h1>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'sidebar-nav-item',
                    isActive && 'active'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-primary">
              Accounting Pro
            </h1>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'sidebar-nav-item',
                    isActive && 'active'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}