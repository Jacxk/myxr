"use client";

import { InfiniteScroll } from "~/components/infinite-scroll";
import { useTRPC, type RouterOutputs } from "~/trpc/react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Grid2X2, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Sound from "~/components/sound/sound";
import { SoundRow } from "~/components/sound/sound-list";
import { Button } from "~/components/ui/button";
import { AudioProvider } from "~/context/AudioContext";

type AllSoundsClient = {
  initialData: RouterOutputs["sound"]["getAllSounds"];
};

export function AllSoundsClient({ initialData }: AllSoundsClient) {
  const searchParams = useSearchParams();
  const [displayAsGrid, setDisplayAsGrid] = useState<boolean>();

  const api = useTRPC();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
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
    setDisplayAsGrid(savedDisplayAsGrid === "true");
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
      <AudioProvider>
        <InfiniteScroll
          data={allSounds}
          renderListItem={(item) => <SoundRow sound={item} />}
          renderGridItem={(item) => <Sound sound={item} />}
          loadMore={fetchNextPage}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          offsetPx={1000}
          listEstimatedSize={105}
          gridEstimatedSize={220}
          displayType={displayAsGrid === false ? "list" : "grid"}
          minItemWidth={160}
        />
      </AudioProvider>
    </div>
  );
}
