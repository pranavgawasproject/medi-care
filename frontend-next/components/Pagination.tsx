import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  /** Build the href for a given page number. */
  hrefFor: (page: number) => string
  className?: string
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Show up to 5 page numbers around the current page.
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from({ length: end - start + 1 }).map(
    (_, i) => start + i
  )

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex items-center justify-center gap-1 text-xs font-mono',
        className
      )}
    >
      <PageLink
        href={hrefFor(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </PageLink>

      {start > 1 && (
        <>
          <PageLink href={hrefFor(1)}>1</PageLink>
          {start > 2 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <PageLink key={p} href={hrefFor(p)} active={p === page}>
          {p}
        </PageLink>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <PageLink href={hrefFor(totalPages)}>{totalPages}</PageLink>
        </>
      )}

      <PageLink
        href={hrefFor(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </PageLink>
    </nav>
  )
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
} & React.AriaAttributes) {
  const base =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors'
  if (disabled) {
    return (
      <span
        className={cn(
          base,
          'border-border bg-transparent text-muted-foreground opacity-50'
        )}
        aria-disabled
      >
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className={cn(
        base,
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-secondary/60'
      )}
      {...rest}
    >
      {children}
    </Link>
  )
}
