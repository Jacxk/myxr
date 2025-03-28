"use client";

import Link from "next/link";
import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/react";

export function LatestSounds() {
  const [latestSounds] = api.sound.getLatests.useSuspenseQuery(
    {},
    { refetchOnWindowFocus: false },
  );

  if (!latestSounds) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-end justify-between">
        <h1 className="text-3xl font-bold">Latest Sounds</h1>
        <Link href="/latest">View more...</Link>
      </div>
      <AudioProvider>
        <div className="flex flex-wrap justify-center gap-4 md:justify-normal">
          {latestSounds.map((sound) => (
            <Sound
              key={sound.id}
              createdBy={{
                id: sound.createdBy.id,
                name: sound.createdBy.name,
              }}
              emoji={sound.emoji}
              id={sound.id}
              name={sound.name}
              url={sound.url}
            />
          ))}
        </div>
      </AudioProvider>
    </div>
  );
}
