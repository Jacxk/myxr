"use client";

import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api } from "~/trpc/react";

export function AllSounds() {
  const { data, fetchNextPage, hasNextPage, isFetching } =
    api.sound.getAllSounds.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const allSounds = data?.pages.flatMap((p) => p.sounds) ?? [];

  return (
    <InfiniteScroll
      loadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoading={isFetching}
    >
      <SoundsGrid>
        {allSounds.map((sound) => (
          <Sound key={sound.id} sound={sound} />
        ))}
      </SoundsGrid>
    </InfiniteScroll>
  );
}
