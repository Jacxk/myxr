import { api, HydrateClient } from "~/trpc/server";
import { LatestSounds } from "./_components/latest-sounds";

export default async function Home() {
  void api.sound.getLatests.prefetch({});

  return (
    <HydrateClient>
      <main className="flex min-h-full flex-col items-center">
        <LatestSounds />
      </main>
    </HydrateClient>
  );
}
