import { api, HydrateClient } from "~/trpc/server";
import { LatestSounds } from "./_components/latest-sounds";
import { AllSounds } from "./_components/page/all-sounds";
import { AudioProvider } from "~/context/AudioContext";

export default async function Home() {
  void api.sound.getLatests.prefetch({});
  void api.sound.getAllSounds.prefetchInfinite({});

  return (
    <HydrateClient>
      <AudioProvider>
        <main className="flex flex-col gap-10">
          <LatestSounds />
          <AllSounds />
        </main>
      </AudioProvider>
    </HydrateClient>
  );
}
