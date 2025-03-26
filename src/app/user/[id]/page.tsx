import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";

export const getSounds = cache(async (id: string) => {
  return await api.user.getSounds(id);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sounds = await getSounds(id);

  if (sounds.length === 0) return {};
  const name = sounds[0]?.createdBy.name;

  return {
    title: `User ${name} Sounds - Myxr`,
  };
}

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const sounds = await getSounds(id);

  if (sounds.length === 0) return notFound();

  const name = sounds[0]?.createdBy.name;

  return (
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
  );
}
