import type { Metadata } from "next";
import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "My Sounds - Myxr",
};

export default async function () {
  const session = await auth();
  const sounds = await api.user.getSounds(session?.user.id!);

  if (sounds.length === 0) {
    return (
      <div className="flex w-full flex-wrap items-center justify-center">
        <span>You have not uploaded any sounds. Give it a try!</span>
      </div>
    );
  }

  return (
    <AudioProvider>
      <div className="flex flex-row flex-wrap gap-2">
        {sounds.map((sound) => (
          <Sound key={sound.id} {...sound} />
        ))}
      </div>
    </AudioProvider>
  );
}
