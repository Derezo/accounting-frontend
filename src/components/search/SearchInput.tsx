import { useState, useEffect, useRef } from 'react'
import { Search, X, Filter, Command } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  showFilters?: boolean
  filterCount?: number
  onFiltersClick?: () => void
  suggestions?: SearchSuggestion[]
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'customer' | 'invoice' | 'quote' | 'payment' | 'user' | 'product' | 'recent'
  subtitle?: string
  metadata?: Record<string, any>
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  showFilters = false,
  filterCount = 0,
  onFiltersClick,
  suggestions = [],
  onSuggestionSelect,
  isLoading = false,
  disabled = false,
  className,
  size = 'default'
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: 'h-8 text-sm',
    default: 'h-10',
    lg: 'h-12 text-lg'
  }

  useEffect(() => {
    setShowSuggestions(isFocused && suggestions.length > 0 && value.length > 0)
    setSelectedIndex(-1)
  }, [isFocused, suggestions.length, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text)
    onSuggestionSelect?.(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
    inputRef.current?.focus()
  }

  const getTypeIcon = (type: SearchSuggestion['type']) => {
    const iconMap = {
      customer: '👤',
      invoice: '📄',
      quote: '📋',
      payment: '💳',
      user: '👥',
      product: '📦',
      recent: '🕒'
    }
    return iconMap[type] || '🔍'
  }

  const getTypeColor = (type: SearchSuggestion['type']) => {
    const colorMap = {
      customer: 'bg-blue-100 text-blue-800',
      invoice: 'bg-green-100 text-green-800',
      quote: 'bg-orange-100 text-orange-800',
      payment: 'bg-purple-100 text-purple-800',
      user: 'bg-gray-100 text-gray-800',
      product: 'bg-indigo-100 text-indigo-800',
      recent: 'bg-yellow-100 text-yellow-800'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setIsFocused(false), 200)
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pl-10 pr-20',
              sizeClasses[size],
              value && 'pr-24'
            )}
          />

          {/* Clear button */}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Filters button */}
        {showFilters && (
          <Button
            variant="outline"
            size={size}
            onClick={onFiltersClick}
            className={cn(
              'ml-2 gap-2',
              sizeClasses[size]
            )}
            disabled={disabled}
          >
            <Filter className="h-4 w-4" />
            Filters
            {filterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filterCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Search suggestions */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            <div ref={suggestionsRef} className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0',
                    selectedIndex === index && 'bg-muted'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{suggestion.text}</p>
                        {suggestion.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">
                            {suggestion.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs', getTypeColor(suggestion.type))}
                    >
                      {suggestion.type}
                    </Badge>
                  </div>
                </button>
              ))}

              {suggestions.length === 0 && value && (
                <div className="px-4 py-3 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No suggestions found</p>
                  <p className="text-xs">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard shortcuts hint */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full right-0 mt-1 z-40">
          <Card className="p-2">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>⎋ close</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}