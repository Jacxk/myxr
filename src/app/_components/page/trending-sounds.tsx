import { api } from "~/trpc/server";
import { AllSoundsClient } from "../../sounds/_components/all-sounds-client";

export async function TrendingSounds() {
  const firstPage = await api.sound.getAllSounds({ cursor: null, limit: 10 });

  return (
    <AllSoundsClient
      initialData={firstPage}
      displayEndMessage={false}
      title={
        <h1 className="text-center text-5xl font-bold sm:text-left sm:text-3xl">
          Trending Sounds
        </h1>
      }
    />
  );
}
