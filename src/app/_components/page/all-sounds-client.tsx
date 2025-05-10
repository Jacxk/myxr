"use client";
import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { useTRPC, type RouterOutputs } from "~/trpc/react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import AdDisplay from "~/components/ad/ad-display";

type AllSoundsClient = {
  initialData: RouterOutputs["sound"]["getAllSounds"];
};

export function AllSoundsClient({ initialData }: AllSoundsClient) {
  const api = useTRPC();
  const { data, fetchNextPage, hasNextPage, isPending } = useInfiniteQuery(
    api.sound.getAllSounds.infiniteQueryOptions(
      {},
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
    <InfiniteScroll
      loadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoading={isPending}
      title={
        <h1 className="col-span-full text-3xl font-bold">Trending Sounds</h1>
      }
    >
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
    </InfiniteScroll>
  );
}
