"use client";

import {
  InfiniteScroll,
  type InfiniteScrollProps,
} from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { useTRPC, type RouterOutputs } from "~/trpc/react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Grid2X2, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import AdDisplay from "~/components/ad/ad-display";
import { SoundsList } from "~/components/sound/sound-list";
import { Button } from "~/components/ui/button";

type AllSoundsClient = {
  initialData: RouterOutputs["sound"]["getAllSounds"];
};

export function AllSoundsClient({
  initialData,
  ...infititeScrollProps
}: AllSoundsClient & Partial<InfiniteScrollProps>) {
  const searchParams = useSearchParams();
  const [displayAsGrid, setDisplayAsGrid] = useState<boolean>();

  const api = useTRPC();
  const { data, fetchNextPage, hasNextPage, isPending } = useInfiniteQuery(
    api.sound.getAllSounds.infiniteQueryOptions(
      { filter: searchParams.get("filter") },
      {
        initialData: {
          pages: [initialData],
          pageParams: [null],
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  const allSounds = data?.pages.flatMap((p) => p.sounds) ?? [];

  const changeDisplayType = (asGrid: boolean) => {
    localStorage.setItem("displayAsGrid", String(asGrid));
    setDisplayAsGrid(asGrid);
  };

  useEffect(() => {
    const savedDisplayAsGrid = localStorage.getItem("displayAsGrid");
    if (savedDisplayAsGrid) setDisplayAsGrid(savedDisplayAsGrid === "true");
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          size="icon"
          variant={displayAsGrid === true ? "default" : "outline"}
          onClick={() => changeDisplayType(true)}
        >
          <Grid2X2 />
        </Button>
        <Button
          size="icon"
          variant={displayAsGrid === false ? "default" : "outline"}
          onClick={() => changeDisplayType(false)}
        >
          <List />
        </Button>
      </div>
      <InfiniteScroll
        {...infititeScrollProps}
        loadMore={fetchNextPage}
        hasMore={hasNextPage}
        isLoading={isPending}
      >
        {displayAsGrid ? (
          <SoundsGrid>
            {allSounds.map((sound, i) => (
              <Fragment key={sound.id}>
                <Sound sound={sound} />
                <AdDisplay
                  adSlot="1944402367"
                  width="100%"
                  height="100%"
                  showProbability={i === allSounds.length - 1 ? 1 : 0.4}
                />
              </Fragment>
            ))}
          </SoundsGrid>
        ) : (
          <SoundsList data={allSounds.map((sound) => ({ sound }))} />
        )}
      </InfiniteScroll>
    </div>
  );
}
