import { Main } from "~/components/main";
import { api } from "~/trpc/server";
import { HeroSection } from "./_components/hero-section";
import { AllSounds } from "./_components/page/all-sounds";
import { LatestSounds } from "./_components/page/latest-sounds";

export default async function Home() {
  void api.sound.getLatests.prefetch({});
  void api.sound.getAllSounds.prefetchInfinite({});

  return (
    <main className="to-background bg-gradient-to-b from-blue-500/30 from-10% to-80%">
      <HeroSection />
      <Main>
        <LatestSounds />
        <AllSounds />
      </Main>
    </main>
  );
}
