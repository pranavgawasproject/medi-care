import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Standard result wrapper used by the data-access layer. Returning
 * `{ data, error }` (instead of throwing) keeps Server Components from
 * blowing up the whole page when a single query fails.
 */
export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: DbError }

export interface DbError {
  message: string
  code?: string
  details?: unknown
}

export function ok<T>(data: T): DbResult<T> {
  return { data, error: null }
}

export function err(message: string, details?: unknown, code?: string): DbError {
  return { message, code, details }
}

/** Convert a Supabase `PostgrestError` (or any thrown error) into a `DbError`. */
export function fromPostgrestError(e: PostgrestError | Error | unknown): DbError {
  if (e && typeof e === 'object' && 'message' in e) {
    const pg = e as Partial<PostgrestError>
    return {
      message: pg.message ?? 'Unknown database error.',
      code: pg.code,
      details: pg.details,
    }
  }
  return { message: (e as Error)?.message ?? 'Unknown database error.' }
}

export interface Pagination {
  page: number
  pageSize: number
}

export interface Paginated<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function paginate<T>(
  rows: T[],
  total: number,
  { page, pageSize }: Pagination
): Paginated<T> {
  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
