import { notFound } from "next/navigation";
import { cache } from "react";
import { getEmojiUrl } from "~/components/emoji-image";
import { env } from "~/env";
import { api } from "~/trpc/server";
import { RelatedSounds } from "./_components/related-sounds";
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

  const title = `${sound.name} - Sound`;
  const description = `Check out this sound: ${sound.name} by ${sound.createdBy.name}${sound.tags.length > 0 ? `- Tags: ${sound.tags.map((tag) => tag.name).join(", ")}` : ""}.`;

  return {
    title,
    description,
    authors: [{ name: sound.createdBy.name }],
    openGraph: {
      title,
      description,
      type: "music.song",
      url: `${env.NEXT_PUBLIC_BASE_URL}/sounds/${id}`,
      audio: sound.url,
      images: [
        {
          url: getEmojiUrl(sound.emoji, true),
          width: 1200,
          height: 1200,
          alt: `${sound.name} sound emoji`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getEmojiUrl(sound.emoji)],
    },
    alternates: {
      canonical: `${env.NEXT_PUBLIC_BASE_URL}/sounds/${id}`,
    },
    other: {
      "audio:artist": sound.createdBy.name,
      "audio:tags": sound.tags.map((tag) => tag.name).join(", "),
    },
  };
}

export default async function SoundIDPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sound = await getSound(id);

  return (
    <SoundPage
      sound={sound}
      id={id}
      related={
        <RelatedSounds
          tags={sound.tags}
          currentSoundId={sound.id}
          soundName={sound.name}
          createdByName={sound.createdBy.name}
        />
      }
    />
  );
}
