import React, { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScreenReaderOnly, Landmark } from './ScreenReaderUtils'
import { KeyboardNavigation, RovingTabIndex } from './KeyboardNavigation'
import { useAccessibility } from './AccessibilityProvider'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Menu, X, Home, Users, FileText, Settings, HelpCircle } from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
  description?: string
  badge?: string | number
  disabled?: boolean
  permission?: string
}

interface AccessibleNavigationProps {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'primary' | 'secondary' | 'sidebar'
  className?: string
  ariaLabel?: string
  showIcons?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function AccessibleNavigation({
  items,
  orientation = 'horizontal',
  variant = 'primary',
  className,
  ariaLabel = 'Main navigation',
  showIcons = true,
  collapsible = false,
  defaultCollapsed = false
}: AccessibleNavigationProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const location = useLocation()
  const { announceMessage } = useAccessibility()

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
      announceMessage(`Collapsed ${items.find(item => item.id === itemId)?.label}`)
    } else {
      newExpanded.add(itemId)
      announceMessage(`Expanded ${items.find(item => item.id === itemId)?.label}`)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const active = item.href ? isActive(item.href) : false
    const Icon = item.icon

    const itemElement = (
      <div
        className={cn(
          'group relative',
          level > 0 && 'ml-4',
          variant === 'sidebar' && 'w-full'
        )}
      >
        {item.href ? (
          <Link
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              active && 'bg-primary text-primary-foreground',
              item.disabled && 'pointer-events-none opacity-50',
              variant === 'sidebar' && 'justify-start',
              variant === 'primary' && orientation === 'horizontal' && 'px-4 py-2'
            )}
            aria-current={active ? 'page' : undefined}
            aria-describedby={item.description ? `${item.id}-desc` : undefined}
            aria-disabled={item.disabled}
          >
            {showIcons && Icon && (
              <Icon className={cn('h-4 w-4', collapsed && variant === 'sidebar' && 'h-5 w-5')} />
            )}

            {(!collapsed || variant !== 'sidebar') && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}

            {collapsed && variant === 'sidebar' && (
              <ScreenReaderOnly>{item.label}</ScreenReaderOnly>
            )}
          </Link>
        ) : (
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
              variant === 'sidebar' && 'justify-start',
              item.disabled && 'opacity-50'
            )}
          >
            {showIcons && Icon && (
              <Icon className="h-4 w-4" />
            )}

            {(!collapsed || variant !== 'sidebar') && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {hasChildren && (!collapsed || variant !== 'sidebar') && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => toggleExpanded(item.id)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label} submenu`}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {item.description && (
          <ScreenReaderOnly>
            <div id={`${item.id}-desc`}>{item.description}</div>
          </ScreenReaderOnly>
        )}
      </div>
    )

    return (
      <li key={item.id} role="none">
        {itemElement}

        {hasChildren && isExpanded && (!collapsed || variant !== 'sidebar') && (
          <ul
            role="group"
            aria-labelledby={`${item.id}-label`}
            className={cn('mt-1 space-y-1', level === 0 && 'ml-4')}
          >
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <Landmark
      role="navigation"
      aria-label={ariaLabel}
      className={cn(
        'relative',
        variant === 'sidebar' && 'h-full',
        className
      )}
    >
      {collapsible && variant === 'sidebar' && (
        <div className="flex items-center justify-between p-4 border-b">
          <span className={cn('font-semibold', collapsed && 'sr-only')}>
            Navigation
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCollapsed(!collapsed)
              announceMessage(collapsed ? 'Navigation expanded' : 'Navigation collapsed')
            }}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      )}

      <KeyboardNavigation
        enableArrowNavigation={true}
        className={cn(
          'p-4',
          variant === 'sidebar' && collapsed && 'p-2'
        )}
      >
        <ul
          role="menubar"
          className={cn(
            'space-y-2',
            orientation === 'horizontal' && variant !== 'sidebar' && 'flex space-y-0 space-x-2'
          )}
        >
          {items.map(item => renderNavigationItem(item))}
        </ul>
      </KeyboardNavigation>
    </Landmark>
  )
}

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface AccessibleBreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  className?: string
}

export function AccessibleBreadcrumb({
  items,
  separator = '/',
  className
}: AccessibleBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-1" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2" aria-hidden="true">
                {separator}
              </span>
            )}

            {item.href && !item.current ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'px-1',
                  item.current && 'text-foreground font-medium'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

interface TabItem {
  id: string
  label: string
  content: ReactNode
  disabled?: boolean
  badge?: string | number
}

interface AccessibleTabsProps {
  items: TabItem[]
  defaultTab?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
  onTabChange?: (tabId: string) => void
}

export function AccessibleTabs({
  items,
  defaultTab,
  orientation = 'horizontal',
  className,
  onTabChange
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id)
  const { announceMessage } = useAccessibility()
  const tabListRef = useRef<HTMLDivElement>(null)

  const handleTabChange = (tabId: string) => {
    const tab = items.find(item => item.id === tabId)
    if (tab && !tab.disabled) {
      setActiveTab(tabId)
      onTabChange?.(tabId)
      announceMessage(`${tab.label} tab selected`)
    }
  }

  const activeTabContent = items.find(item => item.id === activeTab)?.content

  return (
    <div className={cn('space-y-4', className)}>
      <RovingTabIndex
        orientation={orientation}
        className={cn(
          'border-b',
          orientation === 'vertical' && 'flex gap-4'
        )}
      >
        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation={orientation}
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-col space-y-1 border-r pr-4' : 'space-x-1'
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={activeTab === item.id}
              aria-controls={`tabpanel-${item.id}`}
              id={`tab-${item.id}`}
              tabIndex={activeTab === item.id ? 0 : -1}
              disabled={item.disabled}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-md transition-colors',
                'hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                activeTab === item.id
                  ? 'bg-background text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted',
                orientation === 'vertical' && 'rounded-md border-b-0'
              )}
              onClick={() => handleTabChange(item.id)}
            >
              <span className="flex items-center gap-2">
                {item.label}
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                    {item.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className={cn(
            'mt-4',
            orientation === 'vertical' && 'flex-1 mt-0'
          )}
          tabIndex={0}
        >
          {activeTabContent}
        </div>
      </RovingTabIndex>
    </div>
  )
}

// Example navigation configuration for accounting app
export const accountingNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'View business overview and key metrics'
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Manage customer information and relationships'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    description: 'Quotes, invoices, and other business documents',
    children: [
      {
        id: 'quotes',
        label: 'Quotes',
        href: '/quotes',
        description: 'Create and manage price quotes'
      },
      {
        id: 'invoices',
        label: 'Invoices',
        href: '/invoices',
        description: 'Generate and track invoices'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Financial reports and analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure application preferences'
  },
  {
    id: 'help',
    label: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Get help and documentation'
  }
]