"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Grid, List } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import { Button } from "./ui/button";

type DisplayType = "grid" | "list";

export type InfiniteScrollProps<T> = {
  data: T[];
  hasMore: boolean;
  isLoading: boolean;
  listEstimatedSize?: number;
  gridEstimatedSize?: number;
  minItemWidth?: number;
  displayType?: DisplayType;
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
  listEstimatedSize,
  gridEstimatedSize,
  hasMore,
  isLoading,
  children,
  title,
  displayType,
  minItemWidth = 200,
  loader = <p className="text-center text-gray-500">Loading...</p>,
  endMessage = <p className="text-center text-gray-500">No more results.</p>,
  displayEndMessage = true,
  offsetPx = 300,
  threshold = 0,
  manualTrigger = true,
  loadMore,
  renderListItem,
  renderGridItem,
}: InfiniteScrollProps<T>) {
  const [displayAsGrid, setDisplayAsGrid] = useState<boolean | undefined>(
    displayType ? displayType === "grid" : undefined,
  );

  const onInViewChange = (inView: boolean) => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  };

  const changeDisplayType = (asGrid: boolean) => {
    localStorage.setItem("displayAsGrid", String(asGrid));
    setDisplayAsGrid(asGrid);
  };

  useEffect(() => {
    const savedDisplayAsGrid = localStorage.getItem("displayAsGrid");
    if (savedDisplayAsGrid) setDisplayAsGrid(savedDisplayAsGrid === "true");
  }, []);

  if (displayAsGrid && !gridEstimatedSize) {
    throw new Error("Must specify 'gridEstimatedSize' for grid type layout");
  }

  if (!displayAsGrid && !listEstimatedSize) {
    throw new Error("Must specify 'listEstimatedSize' for list type layout");
  }

  return (
    <div className="flex flex-col gap-4">
      {title}
      <div className="flex gap-2">
        <Button
          size="icon"
          variant={displayAsGrid === true ? "default" : "outline"}
          onClick={() => changeDisplayType(true)}
        >
          <Grid />
        </Button>
        <Button
          size="icon"
            variant={!displayAsGrid ? "default" : "outline"}
          onClick={() => changeDisplayType(false)}
        >
          <List />
        </Button>
      </div>
      {children}
      {!displayAsGrid && renderListItem && (
        <ListVirtualizer
          data={data}
          renderItem={renderListItem}
          estimatedSize={listEstimatedSize!}
        />
      )}

      {displayAsGrid && renderGridItem && (
        <GridVirtualizer
          data={data}
          renderItem={renderGridItem}
          estimatedSize={gridEstimatedSize!}
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
