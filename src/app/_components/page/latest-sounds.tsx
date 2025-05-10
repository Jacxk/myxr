import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api } from "~/trpc/server";

export async function LatestSounds() {
  const latestSounds = await api.sound.getLatests({ limit: 9 });

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-3xl font-bold">Latest Sounds</h1>
      <SoundsGrid>
        {latestSounds.map((sound) => (
          <Sound key={sound.id} sound={sound} />
        ))}
      </SoundsGrid>
    </div>
  );
}
