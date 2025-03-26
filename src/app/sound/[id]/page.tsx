import { Avatar } from "@radix-ui/react-avatar";
import { Download, Flag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToGuildButton } from "~/components/sound/add-button";
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { CreatedDate } from "./_components/created-date";
import { SoundEmoji } from "./_components/emoji";
import { Guild } from "./_components/guild";
import { SoundWaveForm } from "~/components/sound/sound-waveform";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Metadata } from "next";
import { cache } from "react";

export const getSound = cache(async (id: string) => {
  return await api.sound.getSound(id);
})

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
  const sound = await getSound(id);

  if (!sound) return notFound();

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-row gap-8">
        <div className="flex">
          <SoundEmoji emoji={sound.emoji} />
        </div>
        <div className="flex flex-grow flex-row justify-between">
          <div className="flex flex-col">
            <div className="flex gap-2">
              <h1 className="text-3xl font-extrabold">{sound.name}</h1>
              <span className="items-center rounded-full bg-secondary p-2 px-3">
                Uses: {sound.usegeCount}
              </span>
            </div>
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
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-col gap-4">
          <h1>Guilds using sound</h1>
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
        <div className="flex w-1/5 flex-col gap-6">
          <CreatedDate date={sound.createdAt} />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Tags</span>
            <div className="flex flex-wrap gap-1">
              {sound.tags.map((tag) => (
                <Button key={tag.name} variant="secondary" asChild>
                  <Link href={`/sound?tag=${tag.name}`}>{tag.name}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
