import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Menu,
  Home,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  FolderOpen,
  BarChart3,
  Settings,
  Shield,
  Building,
  UserCog,
  X,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
  requiredPermission?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and quick actions'
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Manage customer relationships',
    requiredPermission: 'customers:read'
  },
  {
    title: 'Quotes',
    href: '/quotes',
    icon: FileText,
    description: 'Create and manage quotes',
    requiredPermission: 'quotes:read'
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: Receipt,
    description: 'Invoice management and tracking',
    requiredPermission: 'invoices:read'
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
    description: 'Payment processing and tracking',
    requiredPermission: 'payments:read',
    children: [
      {
        title: 'All Payments',
        href: '/payments',
        icon: CreditCard,
        requiredPermission: 'payments:read'
      },
      {
        title: 'E-Transfer',
        href: '/etransfer',
        icon: CreditCard,
        requiredPermission: 'etransfer:read'
      },
      {
        title: 'Manual Payments',
        href: '/manual-payments',
        icon: CreditCard,
        requiredPermission: 'manual-payment:read'
      }
    ]
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    description: 'Project management and tracking',
    requiredPermission: 'projects:read'
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    description: 'Schedule and manage appointments',
    requiredPermission: 'appointments:read'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Business intelligence and insights',
    requiredPermission: 'analytics:read'
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    badge: 'New',
    description: 'Generate and view reports',
    requiredPermission: 'reports:read'
  },
  {
    title: 'Administration',
    href: '/admin',
    icon: Settings,
    description: 'System administration',
    requiredPermission: 'admin:read',
    children: [
      {
        title: 'User Management',
        href: '/admin/users',
        icon: UserCog,
        requiredPermission: 'users:read'
      },
      {
        title: 'Organization',
        href: '/admin/organization',
        icon: Building,
        requiredPermission: 'organization:read'
      },
      {
        title: 'Audit Trail',
        href: '/admin/audit',
        icon: Shield,
        requiredPermission: 'audit:read'
      }
    ]
  }
]

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const location = useLocation()
  const { user, hasPermission } = useAuth()

  const toggleExpanded = (href: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(href)) {
      newExpanded.delete(href)
    } else {
      newExpanded.add(href)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return null
    }

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.href)
    const active = isActive(item.href)

    return (
      <div key={item.href}>
        <div
          className={cn(
            'flex items-center justify-between p-3 rounded-lg transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            active && 'bg-accent text-accent-foreground',
            depth > 0 && 'ml-4 p-2'
          )}
        >
          <Link
            to={hasChildren ? '#' : item.href}
            className="flex items-center gap-3 flex-1"
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault()
                toggleExpanded(item.href)
              } else {
                setIsOpen(false)
              }
            }}
          >
            <item.icon className={cn('h-5 w-5', depth > 0 && 'h-4 w-4')} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={cn('font-medium', depth > 0 && 'text-sm')}>
                  {item.title}
                </span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && depth === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </Link>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => toggleExpanded(item.href)}
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </Button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const visibleItems = navigationItems.filter(item =>
    !item.requiredPermission || hasPermission(item.requiredPermission)
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">
                Navigation
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {user && (
              <div className="text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {user.role}
                </Badge>
              </div>
            )}
          </SheetHeader>

          <Separator />

          <ScrollArea className="flex-1 px-6">
            <nav className="py-4 space-y-2">
              {visibleItems.map(item => renderNavItem(item))}
            </nav>
          </ScrollArea>

          <Separator />

          <div className="p-6 pt-4">
            <div className="text-xs text-muted-foreground text-center">
              Accounting System v1.0
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}