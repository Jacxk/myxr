import { Avatar } from "@radix-ui/react-avatar";
import { Download, Flag } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AddToGuildButton } from "~/components/sound/add-button";
import { LikeButton } from "~/components/sound/like-button";
import { SoundWaveForm } from "~/components/sound/sound-waveform";
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/trpc/server";
import { CreatedDate } from "./_components/created-date";
import { SoundEmoji } from "./_components/emoji";
import { Guild } from "./_components/guild";
import { SoundData } from "./_components/sound-data";
import { auth } from "~/server/auth";

const getSound = cache(async (id: string) => {
  return await api.sound.getSound({ id });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sound = await getSound(id);

  if (!sound) return {};

  return {
    title: `${sound?.name} - Myxr`,
  };
}

export default async function ({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sound = await getSound(id);

  if (!sound) return notFound();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-row gap-4">
        <div className="flex">
          <SoundEmoji emoji={sound.emoji} />
        </div>
        <div className="flex flex-grow flex-col justify-between gap-6 sm:flex-row">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold">{sound.name}</h1>
            <Button
              className="flex w-fit flex-row items-center gap-2 p-0"
              variant="link"
              asChild
            >
              <Link href={`/user/${sound.createdById}`}>
                <Avatar>
                  <AvatarImage
                    className="w-6 rounded-full"
                    src={sound.createdBy.image + "?size=24"}
                    alt={sound.createdBy.name!}
                  />
                  <AvatarFallback delayMs={500}>
                    {sound.createdBy.name}
                  </AvatarFallback>
                </Avatar>
                <span>{sound.createdBy.name}</span>
              </Link>
            </Button>
          </div>

          <div className="flex gap-2">
            <TooltipProvider delayDuration={0}>
              <AddToGuildButton soundId={id} />

              <LikeButton
                soundId={id}
                liked={sound.likedBy.some(
                  (data) => data.userId === session?.user.id,
                )}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Download />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="destructive">
                    <Flag />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Report</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <SoundWaveForm url={sound.url} />
      <div className="border-b" />
      <div className="flex flex-col-reverse justify-between gap-4 sm:flex-row">
        <div className="flex flex-col gap-4">
          {sound.guildSounds.length === 0 ? (
            <span>No guilds are using this sound.</span>
          ) : (
            <span>Guilds using sound</span>
          )}
          <div className="flex flex-wrap gap-4">
            {sound.guildSounds.map((guildSound) => (
              <Guild
                key={guildSound.guild.id}
                name={guildSound.guild.name}
                image=""
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:w-1/5">
          <SoundData title="Created">
            <CreatedDate date={sound.createdAt} />
          </SoundData>

          <SoundData title="Usage">
            {Intl.NumberFormat(navigator.language, {
              notation: "compact",
            }).format(sound.usegeCount)}
          </SoundData>

          <SoundData title="Likes">
            {Intl.NumberFormat(navigator.language, {
              notation: "compact",
            }).format(sound.likedBy.length)}
          </SoundData>

          {sound.tags.length > 0 && (
            <SoundData title="Tags">
              {sound.tags.map((tag) => (
                <Button key={tag.name} variant="secondary" asChild>
                  <Link href={`/sound?tag=${tag.name}`}>{tag.name}</Link>
                </Button>
              ))}
            </SoundData>
          )}
        </div>
      </div>
    </div>
  );
}
