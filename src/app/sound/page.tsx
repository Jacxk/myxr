"use client";

import { useSearchParams } from "next/navigation";
import type { z } from "zod";
import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { useTRPC } from "~/trpc/react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Fragment, Suspense } from "react";
import AdDisplay from "~/components/ad/ad-display";

export default function SoundsHomePage() {
  return (
    <Suspense>
      <SoundsHomePageSuspended />
    </Suspense>
  );
}

function SoundsHomePageSuspended() {
  const api = useTRPC();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const type = searchParams.get("type") as z.infer<
    z.ZodEnum<["normal", "tag"]>
  >;

  const { data, fetchNextPage, hasNextPage, isPending } = useInfiniteQuery(
    api.sound.search.infiniteQueryOptions(
      {
        type,
        query,
      },
      {
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  const hasData = data && (data.pages[0]?.sounds?.length ?? 0) > 0;
  const sounds = data?.pages.flatMap((p) => p.sounds) ?? [];

  return (
    <>
      <title>{`${query} - Search`}</title>
      <h1 className="mb-4 text-xl">Searching Sounds: {query}</h1>
      <InfiniteScroll
        loadMore={fetchNextPage}
        hasMore={hasNextPage}
        isLoading={isPending}
        endMessage={!hasData ? "No sounds where found." : ""}
      >
        <SoundsGrid>
          {sounds.map((sound, i) => (
            <Fragment key={sound.id}>
              <Sound sound={sound} />
              <AdDisplay
                adSlot="1944402367"
                width="100%"
                height="100%"
                showProbability={i === sounds.length - 1 ? 1 : 0.4}
              />
            </Fragment>
          ))}
        </SoundsGrid>
      </InfiniteScroll>
    </>
  );
}
