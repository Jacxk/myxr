import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function () {
  const session = await auth();
  const sounds = await api.user.getSounds(session?.user.id!);

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
