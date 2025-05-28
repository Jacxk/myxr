"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import React, { ReactNode } from "react";
import { InView } from "react-intersection-observer";
import { Button } from "./ui/button";

export type InfiniteScrollProps<T> = {
  data: T[];
  displayType?: "grid" | "list";
  listEstimatedSize: number;
  gridEstimatedSize: number;
  minItemWidth?: number;
  hasMore: boolean;
  isLoading: boolean;
  children?: React.ReactNode;
  title?: React.ReactNode;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  displayEndMessage?: boolean;
  offsetPx?: number;
  threshold?: number;
  manualTrigger?: boolean;
  loadMore: () => void;
  renderListItem?: (item: T, index: number) => ReactNode;
  renderGridItem?: (item: T, index: number) => ReactNode;
};

interface ListVirtualizerProps<T> {
  data: T[];
  estimatedSize: number;
  renderItem: (item: T, index: number) => ReactNode;
}

interface GridVirtualizerProps<T> {
  data: T[];
  estimatedSize: number;
  minItemWidth: number;
  renderItem: (item: T, index: number) => ReactNode;
}

export function InfiniteScroll<T>({
  data,
  displayType = "list",
  renderListItem,
  renderGridItem,
  listEstimatedSize,
  gridEstimatedSize,
  minItemWidth = 200,
  loadMore,
  hasMore,
  isLoading,
  children,
  title,
  loader = <p className="text-center text-gray-500">Loading...</p>,
  endMessage = <p className="text-center text-gray-500">No more results.</p>,
  displayEndMessage = true,
  offsetPx = 300,
  threshold = 0,
  manualTrigger = true,
}: InfiniteScrollProps<T>) {
  const onInViewChange = (inView: boolean) => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {title}
      {children}

      {displayType === "list" && renderListItem && (
        <ListVirtualizer
          data={data}
          renderItem={renderListItem}
          estimatedSize={listEstimatedSize}
        />
      )}

      {displayType === "grid" && renderGridItem && (
        <GridVirtualizer
          data={data}
          renderItem={renderGridItem}
          estimatedSize={gridEstimatedSize}
          minItemWidth={minItemWidth}
        />
      )}

      <InView
        rootMargin={`0px 0px ${offsetPx}px 0px`}
        threshold={threshold}
        onChange={onInViewChange}
      />
      <div className="py-4 text-center">
        {isLoading && loader}
        {!isLoading && !hasMore && displayEndMessage && endMessage}
        {manualTrigger && hasMore && !isLoading && (
          <Button onClick={loadMore} variant="link">
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}

function ListVirtualizer<T>({
  data,
  estimatedSize,
  renderItem,
}: ListVirtualizerProps<T>) {
  const virtualizer = useWindowVirtualizer({
    count: data.length,
    estimateSize: () => estimatedSize,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: virtualizer.getTotalSize(),
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${items[0]?.start ?? 0}px)`,
        }}
      >
        {items.map((item) => (
          <div
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
          >
            {renderItem(data[item.index] as T, item.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

function GridVirtualizer<T>({
  data,
  estimatedSize,
  minItemWidth,
  renderItem,
}: GridVirtualizerProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  const columns = Math.max(1, Math.floor(containerWidth / minItemWidth));
  const rowCount = Math.ceil(data.length / columns);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    updateWidth();

    return () => {
      observer.disconnect();
    };
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimatedSize,
    overscan: 5,
  });

  const rows = virtualizer.getVirtualItems();

  return (
    <div
      ref={containerRef}
      style={{
        height: virtualizer.getTotalSize(),
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${rows[0]?.start ?? 0}px)`,
        }}
      >
        {rows.map((row) => {
          const startIndex = row.index * columns;
          const endIndex = Math.min(startIndex + columns, data.length);
          const rowItems = data.slice(startIndex, endIndex);

          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((item, index) => (
                <div key={startIndex + index}>
                  {renderItem(item, startIndex + index)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
