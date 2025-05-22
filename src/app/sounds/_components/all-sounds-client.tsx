"use client";

import {
  InfiniteScroll,
  type InfiniteScrollProps,
} from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { useTRPC, type RouterOutputs } from "~/trpc/react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Fragment } from "react";
import AdDisplay from "~/components/ad/ad-display";

type AllSoundsClient = {
  initialData: RouterOutputs["sound"]["getAllSounds"];
};

export function AllSoundsClient({
  initialData,
  ...infititeScrollProps
}: AllSoundsClient & Partial<InfiniteScrollProps>) {
  const searchParams = useSearchParams();

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

  return (
    <InfiniteScroll
      {...infititeScrollProps}
      loadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoading={isPending}
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
