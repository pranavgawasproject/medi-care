'use client'

import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Debounce in milliseconds (default 250). */
  debounceMs?: number
}

/**
 * Debounced search input. Updates the parent on every keystroke (so the input
 * is responsive) but emits a debounced "stable" value via `onStable` when the
 * user stops typing — useful for triggering URL search-param updates without
 * spamming the router.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  debounceMs = 250,
  onStable,
}: SearchInputProps & { onStable?: (value: string) => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (!onStable) return
    timer.current = setTimeout(() => onStable(value), debounceMs)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value, debounceMs, onStable])

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

/** Convenience wrapper that doesn't expose `onStable`. */
export function SimpleSearchInput(props: SearchInputProps) {
  return <SearchInput {...props} />
}
