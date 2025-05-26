import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { getServerSession } from "~/lib/auth";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "My Sounds",
};

export default async function MeSoundsPage() {
  const session = await getServerSession();

  if (!session) return unauthorized();

  const sounds = await api.user.getSounds(session.user.id);

  if (sounds.length === 0) {
    return (
      <div className="flex w-full flex-wrap items-center justify-center">
        <span>You have not uploaded any sounds. Give it a try!</span>
      </div>
    );
  }

  return (
    <SoundsGrid>
      {sounds.map((sound) => (
        <Sound key={sound.id} sound={sound} />
      ))}
    </SoundsGrid>
  );
}
