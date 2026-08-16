import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizeNotification } from '@/lib/supabase/normalize'
import type { AppNotification, NotificationType } from '@/lib/types'

export async function listNotifications(
  userId: string
): Promise<DbResult<AppNotification[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizeNotification))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function countUnread(
  userId: string
): Promise<DbResult<number>> {
  try {
    const client = await createClient()
    const { count, error } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(count ?? 0)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function markAsRead(
  id: string,
  userId: string
): Promise<DbResult<AppNotification>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(normalizeNotification(data))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function markAllAsRead(
  userId: string
): Promise<DbResult<{ count: number }>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)
      .select('id')

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok({ count: data?.length ?? 0 })
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export interface CreateNotificationInput {
  user_id: string
  type: NotificationType | string
  title: string
  message: string
  data?: Record<string, unknown>
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<DbResult<AppNotification | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('notifications')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data ?? {},
      })
      .select('*')
      .single()

    if (error) {
      // Don't fail the parent operation just because a notification didn't
      // fire. Surface as a non-fatal error result.
      return ok(null)
    }
    return ok(normalizeNotification(data))
  } catch {
    return ok(null)
  }
}
