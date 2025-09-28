import { useState } from 'react'
import { Plus, Filter, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { CustomerFilters } from '@/components/business/CustomerFilters'
import { useCustomers, useDeleteCustomer } from '@/hooks/useAPI'
import { formatDate } from '@/lib/utils'
import { Customer, CustomerFilters as ICustomerFilters } from '@/types/api'

export function CustomersPage() {
  const [filters, setFilters] = useState<ICustomerFilters>({})
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { data: customersData, isLoading, error } = useCustomers({
    ...filters,
    page: 1,
    limit: 50,
  })

  const deleteCustomer = useDeleteCustomer()

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowEditDialog(true)
  }

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${getCustomerDisplayName(customer)}?`)) {
      await deleteCustomer.mutateAsync(customer.id)
    }
  }

  const getCustomerDisplayName = (customer: Customer) => {
    return customer.type === 'PERSON'
      ? `${customer.person?.firstName} ${customer.person?.lastName}`
      : customer.business?.businessName
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'PROSPECT':
        return 'warning'
      case 'INACTIVE':
        return 'secondary'
      case 'ARCHIVED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ENTERPRISE':
        return 'destructive'
      case 'SMALL_BUSINESS':
        return 'warning'
      case 'PERSONAL':
        return 'secondary'
      case 'EMERGENCY':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and contact information
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your database with their contact information and preferences.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter and search customers to find exactly what you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Customer Directory
            {customersData && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({customersData.pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading customers...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-red-600">Failed to load customers</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please try refreshing the page
                </p>
              </div>
            </div>
          ) : customersData?.data.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No customers found</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first customer
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData?.data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getCustomerDisplayName(customer)}</p>
                        {customer.business?.legalName && customer.business.legalName !== customer.business.businessName && (
                          <p className="text-xs text-muted-foreground">
                            Legal: {customer.business.legalName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.type === 'PERSON' ? 'Individual' : 'Business'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.email && (
                          <p className="truncate max-w-[200px]">{customer.email}</p>
                        )}
                        {customer.phone && (
                          <p className="text-muted-foreground">{customer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTierColor(customer.tier) as any}>
                        {customer.tier.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(customer.status) as any}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer)}
                          disabled={deleteCustomer.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedCustomer && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>
                Update customer information and preferences.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              customer={selectedCustomer}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedCustomer(null)
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedCustomer(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}