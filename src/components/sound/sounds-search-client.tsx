"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { InfiniteScroll } from "~/components/infinite-scroll";
import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { type RouterOutputs, useTRPC } from "~/trpc/react";
import { SoundRow, Sound as SoundType } from "./sound-list";

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
      <AudioProvider>
        <InfiniteScroll
          data={sounds}
          renderListItem={(item) => <SoundRow sound={item as SoundType} />}
          renderGridItem={(item) => <Sound sound={item} />}
          loadMore={fetchNextPage}
          hasMore={hasNextPage}
          isLoading={isPending}
          endMessage={!hasData ? "No sounds where found." : ""}
          listEstimatedSize={105}
          gridEstimatedSize={220}
          minItemWidth={160}
        />
      </AudioProvider>
    </>
  );
}
