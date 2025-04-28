import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { SoundPage } from "./_components/sound-page";

export default async function SoundIDPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sound = await api.sound.getSound({ id });

  if (!sound) return notFound();

  return (
    <>
      <title>{`${sound.name} - Sound`}</title>
      <SoundPage sound={sound} id={id} />
    </>
  );
}
