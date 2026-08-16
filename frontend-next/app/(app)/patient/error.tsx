'use client'

import { Button } from '@/components/ui'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
        <h2 className="text-base font-semibold text-foreground">
          Couldn&rsquo;t load this page
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          An unexpected error occurred while loading your dashboard.
        </p>
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  )
}
