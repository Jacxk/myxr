"use client";

import { InView } from "react-intersection-observer";
import { Button } from "./ui/button";

type InfiniteScrollProps = {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  offsetPx?: number;
  threshold?: number;
  manualTrigger?: boolean;
};

export function InfiniteScroll({
  loadMore,
  hasMore,
  isLoading,
  children,
  loader = <p className="text-center text-gray-500">Loading...</p>,
  endMessage = <p className="text-center text-gray-500">No more results.</p>,
  offsetPx = 300,
  threshold = 0,
  manualTrigger = true,
}: Readonly<InfiniteScrollProps>) {
  const onInViewChange = (inView: boolean) => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  };

  return (
    <>
      {children}
      <InView
        rootMargin={`0px 0px ${offsetPx}px 0px`}
        threshold={threshold}
        onChange={onInViewChange}
      />
      <div className="py-4 text-center">
        {isLoading && loader}
        {!isLoading && !hasMore && endMessage}
        {manualTrigger && hasMore && !isLoading && (
          <Button onClick={loadMore} variant="link">
            Load more
          </Button>
        )}
      </div>
    </>
  );
}
