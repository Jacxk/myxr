"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import type { z } from "zod";
import AdDisplay from "~/components/ad/ad-display";
import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { type RouterOutputs, useTRPC } from "~/trpc/react";

interface SoundsSearchClientProps {
  initialData: RouterOutputs["sound"]["search"];
  query: string;
  type: z.infer<z.ZodEnum<["normal", "tag"]>>;
}

export function SoundsSearchClient({
  initialData,
  query,
  type,
}: SoundsSearchClientProps) {
  const api = useTRPC();

  const { data, fetchNextPage, hasNextPage, isPending } = useInfiniteQuery(
    api.sound.search.infiniteQueryOptions(
      {
        type,
        query,
      },
      {
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: {
          pages: [initialData],
          pageParams: [null],
        },
      },
    ),
  );

  const hasData = data && (data.pages[0]?.sounds?.length ?? 0) > 0;
  const sounds = data?.pages.flatMap((p) => p.sounds) ?? [];

  return (
    <>
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
