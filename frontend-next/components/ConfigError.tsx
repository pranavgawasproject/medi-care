import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

interface ConfigErrorProps {
  title?: string
  message?: string
  /** Hide the retry button (e.g. on a static landing page). */
  hideRetry?: boolean
}

/**
 * Rendered when Supabase env vars aren't configured. Surfaces a clear
 * configuration error UI instead of silently falling back to fake data.
 */
export function ConfigError({
  title = 'Service unavailable',
  message = 'This page requires Supabase to be configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment, then redeploy.',
  hideRetry,
}: ConfigErrorProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 rounded-md border border-destructive/30 bg-card p-6 shadow-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{message}</p>
        {!hideRetry && (
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') window.location.reload()
            }}
            className="mx-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        )}
      </div>
    </div>
  )
}
