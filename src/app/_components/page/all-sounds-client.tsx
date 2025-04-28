"use client";

import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api, RouterOutputs } from "~/trpc/react";

type AllSoundsClient = {
  initialData: RouterOutputs["sound"]["getAllSounds"];
};

export function AllSoundsClient({ initialData }: AllSoundsClient) {
  const { data, fetchNextPage, hasNextPage, isFetching } =
    api.sound.getAllSounds.useInfiniteQuery(
      {},
      {
        initialData: {
          pages: [initialData],
          pageParams: [null],
        },
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
