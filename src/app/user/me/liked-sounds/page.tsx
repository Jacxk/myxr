import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api } from "~/trpc/server";

export default async function () {
  const sounds = await api.user.likedSounds();

  return (
    <SoundsGrid sm={4} md={5} lg={6} xl={8}>
      {sounds.map((sound) => (
        <Sound key={sound.id} {...sound} />
      ))}
    </SoundsGrid>
  );
}
