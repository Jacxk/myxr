"use client";

import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { api } from "~/trpc/react";

export function AllSounds() {
  const { data, fetchNextPage, hasNextPage, isFetching } =
    api.sound.getAllSounds.useInfiniteQuery(
      {},
      {
        refetchOnWindowFocus: false,
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
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
        {allSounds.map((sound) => (
          <Sound key={sound.id} {...sound} />
        ))}
      </div>
    </InfiniteScroll>
  );
}
