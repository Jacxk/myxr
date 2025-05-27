import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col">
      <Skeleton className="h-8 w-48 self-center" />
      <Skeleton className="mx-2 h-8 w-8 self-end" />
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-4">
              <Skeleton className="h-[70px] w-[70px] rounded-lg" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 self-end">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
