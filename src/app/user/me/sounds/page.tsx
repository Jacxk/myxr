import type { Metadata } from "next";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { getServerSession } from "~/lib/auth";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "My Sounds - Myxr",
};

export default async function () {
  const session = await getServerSession();
  const sounds = await api.user.getSounds(session?.user.id!);

  if (sounds.length === 0) {
    return (
      <div className="flex w-full flex-wrap items-center justify-center">
        <span>You have not uploaded any sounds. Give it a try!</span>
      </div>
    );
  }

  return (
    <SoundsGrid sm={4} md={5} lg={6} xl={8}>
      <div className="flex flex-row flex-wrap justify-center gap-2">
        {sounds.map((sound) => (
          <Sound key={sound.id} {...sound} />
        ))}
      </div>
    </SoundsGrid>
  );
}
