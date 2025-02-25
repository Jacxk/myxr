"use client";

import { api } from "~/trpc/react";

export function LatestSounds() {
  const [latestSounds] = api.sound.getLatests.useSuspenseQuery({});

  if (!latestSounds) {
    return null;
  }

  return (
    <div className="w-full max-w-xs">
      {latestSounds.map((sound) => (
        <div key={sound?.id}>
          <h1>{sound?.emoji}</h1>
          <h2>{sound?.name}</h2>
          <audio controls>
            <source src={sound?.url} type="audio/mpeg" />
          </audio>
        </div>
      ))}
    </div>
  );
}
