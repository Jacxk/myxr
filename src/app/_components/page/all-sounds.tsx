"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import Sound from "~/components/sound/sound";
import { api } from "~/trpc/react";

export function AllSounds() {
  const { data, fetchNextPage, hasNextPage } =
    api.sound.getAllSounds.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <InfiniteScroll
      dataLength={data?.pages.flatMap((page) => page.sounds).length ?? 0}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={null}
      className="grid w-full grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9"
    >
      {data?.pages.flatMap((page, pageIndex) =>
        page.sounds.map((sound) => (
          <Sound key={`${sound.id} - ${pageIndex}`} {...sound} />
        )),
      )}
    </InfiniteScroll>
  );
}
