"use client";

import Sound from "~/components/sound";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/react";

export function LatestSounds() {
  const [latestSounds] = api.sound.getLatests.useSuspenseQuery({});

  if (!latestSounds) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4 p-5">
      <h1 className="text-3xl font-bold">Latest Sounds</h1>
      <AudioProvider>
        <div className="flex flex-wrap gap-4">
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
