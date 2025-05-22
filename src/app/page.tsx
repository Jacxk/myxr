import { Main } from "~/components/main";
import { HeroSection } from "./_components/page/hero-section";
import { LatestSounds } from "./_components/page/latest-sounds";
import { TrendingSounds } from "./_components/page/trending-sounds";

export default async function Home() {
  return (
    <main className="to-background -mt-30 bg-linear-to-b from-purple-500/20 pt-30 dark:from-blue-600/30">
      <HeroSection />
      <Main>
        <LatestSounds />
        <TrendingSounds />
      </Main>
    </main>
  );
}
