import { api, HydrateClient } from "~/trpc/server";
import { LatestSounds } from "./_components/sound";

export default async function Home() {
  void api.sound.getLatests.prefetch({});

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <LatestSounds />
        </div>
      </main>
    </HydrateClient>
  );
}
