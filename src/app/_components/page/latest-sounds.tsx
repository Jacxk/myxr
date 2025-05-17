import { Fragment } from "react";
import AdDisplay from "~/components/ad/ad-display";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api } from "~/trpc/server";

export async function LatestSounds() {
  const latestSounds = await api.sound.getLatests({ limit: 9 });

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-center text-5xl font-bold sm:text-left sm:text-3xl">
        Latest Sounds
      </h1>
      <SoundsGrid>
        {latestSounds.map((sound, i) => (
          <Fragment key={sound.id}>
            <Sound sound={sound} />
            <AdDisplay
              adSlot="1944402367"
              width="100%"
              height="100%"
              showProbability={i === latestSounds.length - 1 ? 1 : 0.4}
            />
          </Fragment>
        ))}
      </SoundsGrid>
    </div>
  );
}
