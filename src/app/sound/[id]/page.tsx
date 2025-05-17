import { notFound } from "next/navigation";
import { cache } from "react";
import { api } from "~/trpc/server";
import { SoundPage } from "./_components/sound-page";

const getSound = cache(async (id: string) => {
  const sound = await api.sound.getSound({ id });
  if (!sound) return notFound();

  return sound;
});

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  const sound = await getSound(id);

  return {
    title: `${sound.name} - Sound`,
  };
}

export default async function SoundIDPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sound = await getSound(id);

  return <SoundPage sound={sound} id={id} />;
}
