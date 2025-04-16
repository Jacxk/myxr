import { notFound } from "next/navigation";
import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const sounds = await api.user.getSounds(id);

  if (sounds.length === 0) return notFound();

  const name = sounds[0]?.createdBy.name ?? "Unknown User";

  return (
    <>
      <title>{`${name} - User`}</title>
      <meta name="author" content={name} />
      <AudioProvider>
        <div className="flex flex-col gap-4">
          <h1>Sounds uploaded by {name}</h1>
          <div className="flex flex-row gap-4">
            {sounds.map((sound) => (
              <Sound key={sound.id} {...sound} />
            ))}
          </div>
        </div>
      </AudioProvider>
    </>
  );
}
