import { api } from "~/trpc/server";
import { AllSounds } from "./_components/page/all-sounds";
import { LatestSounds } from "./_components/page/latest-sounds";

export default async function Home() {
  void api.sound.getLatests.prefetch({});
  void api.sound.getAllSounds.prefetchInfinite({});

  return (
    <main className="flex flex-col gap-10">
      <LatestSounds />
      <AllSounds />
    </main>
  );
}
