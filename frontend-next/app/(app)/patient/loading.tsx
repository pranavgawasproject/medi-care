import { SkeletonCard, SkeletonTable } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={5} />
    </div>
  )
}
