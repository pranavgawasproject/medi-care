'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SearchInput } from '@/components/SearchInput'

export function PatientSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(initialQuery)

  // Keep input in sync if the URL changes externally.
  useEffect(() => {
    setValue(params.get('q') ?? '')
  }, [params])

  return (
    <SearchInput
      value={value}
      onChange={setValue}
      onStable={(stable) => {
        const q = stable.trim()
        const url = q ? `/doctor/patients?q=${encodeURIComponent(q)}` : '/doctor/patients'
        router.push(url)
      }}
      placeholder="Search by name, email, or phone…"
      debounceMs={300}
      className="max-w-md"
    />
  )
}
