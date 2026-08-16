import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { EmptyState } from '@/components/EmptyState'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  emptyState?: ReactNode
  className?: string
}

/**
 * Server Component table. Caller is responsible for sorting/filtering/pagination
 * server-side (or via URL search params). This keeps function props (cell renderers)
 * on the server side, avoiding the Server→Client Component boundary restriction.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className={cn(className)}>
        {emptyState ?? (
          <EmptyState title="No records found" description="Try adjusting your filters." />
        )}
      </div>
    )
  }

  return (
    <div className={cn('rounded-md border border-border bg-card', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
