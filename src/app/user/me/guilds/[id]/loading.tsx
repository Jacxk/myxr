import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mx-2 h-8 w-8 self-end" />
      <div className="flex w-full flex-col">
        <div className="grid h-full w-full grid-cols-4 items-center p-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="col-span-2 h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid h-fit w-full cursor-pointer grid-cols-4 items-center p-2"
            >
              <Skeleton className="h-[34px] w-[34px] rounded-full" />
              <Skeleton className="col-span-2 h-4 w-1/2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
