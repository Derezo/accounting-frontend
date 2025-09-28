import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchOptions {
  debounceMs?: number
  minSearchLength?: number
  searchFields?: string[]
  caseSensitive?: boolean
}

interface UseSearchResult<T> {
  searchTerm: string
  setSearchTerm: (term: string) => void
  debouncedSearchTerm: string
  filteredData: T[]
  isSearching: boolean
  clearSearch: () => void
  searchCount: number
}

/**
 * Hook for implementing search functionality with debouncing
 */
export function useSearch<T>(
  data: T[],
  options: SearchOptions = {}
): UseSearchResult<T> {
  const {
    debounceMs = 300,
    minSearchLength = 1,
    searchFields = [],
    caseSensitive = false
  } = options

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  const isSearching = useMemo(() => {
    return searchTerm.length >= minSearchLength && searchTerm !== debouncedSearchTerm
  }, [searchTerm, debouncedSearchTerm, minSearchLength])

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return data
    }

    const searchValue = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase()

    return data.filter((item) => {
      // If no search fields specified, search all string properties
      if (searchFields.length === 0) {
        return Object.values(item as Record<string, any>).some((value) => {
          if (typeof value === 'string') {
            const compareValue = caseSensitive ? value : value.toLowerCase()
            return compareValue.includes(searchValue)
          }
          return false
        })
      }

      // Search specific fields
      return searchFields.some((field) => {
        const value = getNestedProperty(item, field)
        if (typeof value === 'string') {
          const compareValue = caseSensitive ? value : value.toLowerCase()
          return compareValue.includes(searchValue)
        }
        return false
      })
    })
  }, [data, debouncedSearchTerm, minSearchLength, searchFields, caseSensitive])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const searchCount = filteredData.length

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredData,
    isSearching,
    clearSearch,
    searchCount
  }
}

/**
 * Hook for implementing filters with search
 */
interface FilterConfig {
  [key: string]: any
}

interface UseFilteredSearchResult<T> extends UseSearchResult<T> {
  filters: FilterConfig
  setFilter: (key: string, value: any) => void
  clearFilter: (key: string) => void
  clearAllFilters: () => void
  activeFilterCount: number
  filteredAndSearchedData: T[]
}

export function useFilteredSearch<T>(
  data: T[],
  searchOptions: SearchOptions = {}
): UseFilteredSearchResult<T> {
  const [filters, setFilters] = useState<FilterConfig>({})

  const searchResult = useSearch(data, searchOptions)

  const filteredAndSearchedData = useMemo(() => {
    let result = searchResult.filteredData

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return
      }

      result = result.filter((item) => {
        const itemValue = getNestedProperty(item, key)

        // Handle different filter types
        if (Array.isArray(value)) {
          // Multi-select filter
          if (value.length === 0) return true
          return value.includes(itemValue)
        } else if (typeof value === 'object' && value !== null) {
          // Range filter (date or number)
          if (value.min !== undefined && value.max !== undefined) {
            return itemValue >= value.min && itemValue <= value.max
          } else if (value.from !== undefined && value.to !== undefined) {
            const itemDate = new Date(itemValue)
            const fromDate = value.from ? new Date(value.from) : null
            const toDate = value.to ? new Date(value.to) : null

            if (fromDate && toDate) {
              return itemDate >= fromDate && itemDate <= toDate
            } else if (fromDate) {
              return itemDate >= fromDate
            } else if (toDate) {
              return itemDate <= toDate
            }
          }
          return true
        } else {
          // Simple equality filter
          return itemValue === value
        }
      })
    })

    return result
  }, [searchResult.filteredData, filters])

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({})
  }, [])

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== null && value !== undefined && value !== ''
    }).length
  }, [filters])

  return {
    ...searchResult,
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
    filteredAndSearchedData
  }
}

/**
 * Hook for search suggestions
 */
interface SearchSuggestion {
  id: string
  text: string
  type: string
  subtitle?: string
  metadata?: Record<string, any>
}

interface UseSuggestionsOptions {
  maxSuggestions?: number
  minSearchLength?: number
  includeRecent?: boolean
  recentKey?: string
}

export function useSearchSuggestions<T>(
  data: T[],
  extractSuggestion: (item: T) => SearchSuggestion,
  searchTerm: string,
  options: UseSuggestionsOptions = {}
) {
  const {
    maxSuggestions = 10,
    minSearchLength = 1,
    includeRecent = true,
    recentKey = 'recent_searches'
  } = options

  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    if (includeRecent) {
      try {
        const stored = localStorage.getItem(recentKey)
        if (stored) {
          setRecentSearches(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Failed to load recent searches:', error)
      }
    }
  }, [includeRecent, recentKey])

  const suggestions = useMemo(() => {
    if (searchTerm.length < minSearchLength) {
      // Show recent searches when no search term
      return includeRecent ? recentSearches.slice(0, maxSuggestions) : []
    }

    const lowerSearchTerm = searchTerm.toLowerCase()
    const matchingSuggestions: SearchSuggestion[] = []

    // Find matching items
    for (const item of data) {
      if (matchingSuggestions.length >= maxSuggestions) break

      const suggestion = extractSuggestion(item)
      if (suggestion.text.toLowerCase().includes(lowerSearchTerm) ||
          suggestion.subtitle?.toLowerCase().includes(lowerSearchTerm)) {
        matchingSuggestions.push(suggestion)
      }
    }

    return matchingSuggestions
  }, [data, searchTerm, minSearchLength, maxSuggestions, recentSearches, includeRecent, extractSuggestion])

  const addToRecent = useCallback((suggestion: SearchSuggestion) => {
    if (!includeRecent) return

    setRecentSearches(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.id !== suggestion.id)
      // Add to beginning
      const newRecent = [{ ...suggestion, type: 'recent' }, ...filtered].slice(0, 10)

      // Save to localStorage
      try {
        localStorage.setItem(recentKey, JSON.stringify(newRecent))
      } catch (error) {
        console.error('Failed to save recent searches:', error)
      }

      return newRecent
    })
  }, [includeRecent, recentKey])

  const clearRecent = useCallback(() => {
    setRecentSearches([])
    try {
      localStorage.removeItem(recentKey)
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }, [recentKey])

  return {
    suggestions,
    addToRecent,
    clearRecent
  }
}

// Helper function to get nested object properties
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}