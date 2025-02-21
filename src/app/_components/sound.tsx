"use client";

import { api } from "~/trpc/react";

export function LatestSounds() {
  const [latestSounds] = api.sound.getLatests.useSuspenseQuery({});

  return (
    <div className="w-full max-w-xs">
      {latestSounds ? (
        <p className="truncate">recent sounds: {latestSounds.name}</p>
      ) : (
        <p>no sounds yet.</p>
      )}
    </div>
  );
}
