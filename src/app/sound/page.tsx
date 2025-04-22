"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api } from "~/trpc/react";

export default function () {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const type = searchParams.get("type") as z.infer<
    z.ZodEnum<["normal", "tag"]>
  >;

  if (!query) return <span>No query provided.</span>;

  const { data, fetchNextPage, hasNextPage, isFetching } =
    api.sound.search.useInfiniteQuery(
      {
        type,
        query,
      },
      {
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const hasData = data && (data.pages[0]?.sounds?.length ?? 0) > 0;
  const sounds = data?.pages.flatMap((p) => p.sounds) ?? [];

  return (
    <>
      <title>{`${query} - Search`}</title>
      <InfiniteScroll
        loadMore={fetchNextPage}
        hasMore={hasNextPage}
        isLoading={isFetching}
        endMessage={!hasData ? "No sounds where found." : ""}
      >
        <SoundsGrid>
          {sounds.map((sound) => (
            <Sound key={sound.id} {...sound} />
          ))}
        </SoundsGrid>
      </InfiniteScroll>
    </>
  );
}
