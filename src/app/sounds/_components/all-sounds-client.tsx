"use client";

import { InfiniteScroll } from "~/components/infinite-scroll";
import { useTRPC, type RouterOutputs } from "~/trpc/react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Sound from "~/components/sound/sound";
import { SoundRow } from "~/components/sound/sound-list";
import { AudioProvider } from "~/context/AudioContext";

type AllSoundsClient = {
  initialData: RouterOutputs["sound"]["getAllSounds"];
};

export function AllSoundsClient({ initialData }: AllSoundsClient) {
  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-col gap-4">
      <AudioProvider>
        <InfiniteScroll
          data={allSounds}
          renderListItem={(item) => <SoundRow sound={item} />}
          renderGridItem={(item) => <Sound sound={item} />}
          loadMore={fetchNextPage}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          listEstimatedSize={105}
          gridEstimatedSize={220}
          minItemWidth={160}
          displayType="grid"
        />
      </AudioProvider>
    </div>
  );
}
