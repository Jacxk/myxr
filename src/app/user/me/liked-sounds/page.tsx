import { type Metadata } from "next";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "My Liked Sounds",
};

export default async function MeLikedSounds() {
  const sounds = await api.user.likedSounds();

  if (sounds.length === 0)
    return (
      <div className="flex w-full flex-wrap items-center justify-center">
        <span>You have not liked any sounds yet. Why is that?</span>
      </div>
    );

  return (
    <SoundsGrid>
      {sounds.map((sound) => (
        <Sound key={sound.id} sound={sound} />
      ))}
    </SoundsGrid>
  );
}
