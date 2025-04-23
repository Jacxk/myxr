import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api } from "~/trpc/server";

export default async function () {
  const sounds = await api.user.likedSounds();

  if (sounds.length === 0)
    return (
      <div className="flex w-full flex-wrap items-center justify-center">
        <span>You have not liked any sounds yet. Why is that?</span>
      </div>
    );

  return (
    <SoundsGrid sm={4} md={5} lg={6} xl={8}>
      {sounds.map((sound) => (
        <Sound key={sound.id} {...sound} />
      ))}
    </SoundsGrid>
  );
}
