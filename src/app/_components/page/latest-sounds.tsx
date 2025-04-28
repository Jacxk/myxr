import Link from "next/link";
import Sound from "~/components/sound/sound";
import { Button } from "~/components/ui/button";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";

export async function LatestSounds() {
  const latestSounds = await api.sound.getLatests({ limit: 9 });

  return (
    <div className="grid w-full grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
      <h1 className="col-span-full text-3xl font-bold">Latest Sounds</h1>
      <AudioProvider>
        {latestSounds.map((sound) => (
          <Sound key={sound.id} sound={sound} />
        ))}
      </AudioProvider>
      <div className="col-span-full flex justify-center">
        <Button variant="link" asChild>
          <Link href="/latest">View more...</Link>
        </Button>
      </div>
    </div>
  );
}
