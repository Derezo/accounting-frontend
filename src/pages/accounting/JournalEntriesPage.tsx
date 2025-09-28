import React, { useState } from 'react'
import { Plus, Search, Filter, Download, Upload, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useJournalEntries, usePostJournalEntry, useReverseJournalEntry } from '@/hooks/useAccounting'
import { JournalEntryType, JournalEntryStatus, JournalEntryFilters } from '@/types/accounting'
import { JournalEntriesTable } from '@/components/accounting/JournalEntriesTable'
import { JournalEntryForm } from '@/components/accounting/JournalEntryForm'
import { JournalEntryDetails } from '@/components/accounting/JournalEntryDetails'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useAccessibility } from '@/components/accessibility'

const ENTRY_TYPES: { value: JournalEntryType; label: string }[] = [
  { value: 'STANDARD', label: 'Standard Entry' },
  { value: 'ADJUSTING', label: 'Adjusting Entry' },
  { value: 'CLOSING', label: 'Closing Entry' },
  { value: 'REVERSING', label: 'Reversing Entry' }
]

const ENTRY_STATUSES: { value: JournalEntryStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'POSTED', label: 'Posted' },
  { value: 'REVERSED', label: 'Reversed' }
]

export function JournalEntriesPage() {
  const { announceMessage } = useAccessibility()
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [postConfirm, setPostConfirm] = useState<string | null>(null)
  const [reverseConfirm, setReverseConfirm] = useState<string | null>(null)
  const [reverseDate, setReverseDate] = useState('')
  const [filters, setFilters] = useState<JournalEntryFilters>({
    status: 'DRAFT'
  })

  const { data: entriesData, isLoading, error } = useJournalEntries(filters)
  const postEntry = usePostJournalEntry()
  const reverseEntry = useReverseJournalEntry()

  const handleFilterChange = (key: keyof JournalEntryFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
    announceMessage(`Filter updated: ${key}`)
  }

  const handleCreateEntry = () => {
    setEditingEntry(null)
    setShowForm(true)
    announceMessage('Opening journal entry creation form')
  }

  const handleEditEntry = (entryId: string) => {
    setEditingEntry(entryId)
    setShowForm(true)
    announceMessage('Opening journal entry edit form')
  }

  const handleViewDetails = (entryId: string) => {
    setShowDetails(entryId)
    announceMessage('Opening journal entry details')
  }

  const handlePostEntry = async (entryId: string) => {
    try {
      await postEntry.mutateAsync(entryId)
      setPostConfirm(null)
      announceMessage('Journal entry posted successfully')
    } catch (error) {
      console.error('Failed to post entry:', error)
    }
  }

  const handleReverseEntry = async (entryId: string) => {
    try {
      await reverseEntry.mutateAsync({
        entryId,
        reversalDate: reverseDate,
        description: 'Reversal entry'
      })
      setReverseConfirm(null)
      setReverseDate('')
      announceMessage('Journal entry reversed successfully')
    } catch (error) {
      console.error('Failed to reverse entry:', error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEntry(null)
  }

  const handleDetailsClose = () => {
    setShowDetails(null)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load journal entries. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground">
            Record and manage financial transactions through journal entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleCreateEntry}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search journal entries..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={filters.type || ''}
          onValueChange={(value) => handleFilterChange('type', value || undefined)}
        >
          <option value="">All Types</option>
          {ENTRY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.status || ''}
          onValueChange={(value) => handleFilterChange('status', value || undefined)}
        >
          <option value="">All Statuses</option>
          {ENTRY_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          placeholder="Date From"
          value={filters.dateFrom || ''}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          placeholder="Date To"
          value={filters.dateTo || ''}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          className="w-40"
        />
      </div>

      <Separator />

      {/* Content */}
      <JournalEntriesTable
        entries={entriesData?.data || []}
        isLoading={isLoading}
        onEdit={handleEditEntry}
        onViewDetails={handleViewDetails}
        onPost={(entryId) => setPostConfirm(entryId)}
        onReverse={(entryId) => {
          setReverseConfirm(entryId)
          setReverseDate(new Date().toISOString().split('T')[0])
        }}
      />

      {/* Journal Entry Form Modal */}
      {showForm && (
        <JournalEntryForm
          entryId={editingEntry}
          open={showForm}
          onClose={handleFormClose}
        />
      )}

      {/* Journal Entry Details Modal */}
      {showDetails && (
        <JournalEntryDetails
          entryId={showDetails}
          open={!!showDetails}
          onClose={handleDetailsClose}
          onEdit={() => {
            handleDetailsClose()
            handleEditEntry(showDetails)
          }}
        />
      )}

      {/* Post Confirmation */}
      {postConfirm && (
        <ConfirmDialog
          open={!!postConfirm}
          onClose={() => setPostConfirm(null)}
          onConfirm={() => handlePostEntry(postConfirm)}
          title="Post Journal Entry"
          description="Are you sure you want to post this journal entry? Posted entries affect account balances and cannot be edited."
          confirmText="Post Entry"
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        />
      )}

      {/* Reverse Confirmation */}
      {reverseConfirm && (
        <ConfirmDialog
          open={!!reverseConfirm}
          onClose={() => {
            setReverseConfirm(null)
            setReverseDate('')
          }}
          onConfirm={() => handleReverseEntry(reverseConfirm)}
          title="Reverse Journal Entry"
          description={
            <div className="space-y-4">
              <p>Are you sure you want to reverse this journal entry? This will create a new reversing entry.</p>
              <div>
                <label className="block text-sm font-medium mb-2">Reversal Date:</label>
                <Input
                  type="date"
                  value={reverseDate}
                  onChange={(e) => setReverseDate(e.target.value)}
                  required
                />
              </div>
            </div>
          }
          confirmText="Create Reversal"
          variant="destructive"
          icon={<RotateCcw className="h-6 w-6 text-destructive" />}
        />
      )}
    </div>
  )
}