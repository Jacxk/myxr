"use client";

import Link from "next/link";
import { AddToGuildButton } from "~/components/sound/add-button";
import { LikeButton } from "~/components/sound/like-button";
import { SoundWaveForm } from "~/components/sound/sound-waveform";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { TooltipProvider } from "~/components/ui/tooltip";
import type { RouterOutputs } from "~/trpc/react";
import { DownloadButton } from "./action-button/download";
import { ReportButton } from "./action-button/report";
import { CreatedDate } from "./created-date";
import { SoundEmoji } from "./emoji";
import { Guild } from "./guild";
import { SoundData } from "./sound-data";

type SoundPageProps = {
  id: string;
  sound: NonNullable<RouterOutputs["sound"]["getSound"]>;
  isPreview?: boolean;
};

function ActionButtons({ id, sound, isPreview }: SoundPageProps) {
  return (
    <div className="flex gap-2">
      <TooltipProvider delayDuration={0}>
        <AddToGuildButton
          soundId={id}
          isPreview={isPreview}
          usage={sound.usegeCount}
        />

        <LikeButton
          soundId={id}
          liked={sound.likedByUser}
          isPreview={isPreview}
          likes={sound.likes}
        />

        <DownloadButton
          soundUrl={sound.url}
          soundId={sound.id}
          soundName={sound.name}
          downloads={sound.downloadCount}
        />

        <ReportButton id={id} isPreview={isPreview} />
      </TooltipProvider>
    </div>
  );
}

export function SoundPage({ id, sound, isPreview }: Readonly<SoundPageProps>) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-row gap-10">
        <div className="flex shrink-0">
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
              <Link href={isPreview ? "" : `/user/${sound.createdBy?.id}`}>
                <Avatar className="h-6 w-6 shrink-0 rounded-full">
                  <AvatarImage
                    src={sound.createdBy?.image + "?size=24"}
                    alt={sound.createdBy?.name ?? ""}
                  />
                  <AvatarFallback delayMs={500}>
                    {sound.createdBy?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{sound.createdBy?.name}</span>
              </Link>
            </Button>
          </div>
          <ActionButtons id={id} sound={sound} isPreview={isPreview} />
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
                image={guildSound.guild.image}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:w-1/5">
          <SoundData title="Created">
            <CreatedDate date={sound.createdAt} />
          </SoundData>

          {(sound.tags?.length ?? 0) > 0 && (
            <SoundData title="Tags">
              {sound.tags?.map((tag) => (
                <Button key={tag.name} variant="secondary" asChild>
                  <Link
                    href={isPreview ? "" : `/sound?query=${tag.name}&type=tag`}
                  >
                    {tag.name}
                  </Link>
                </Button>
              ))}
            </SoundData>
          )}
        </div>
      </div>
    </div>
  );
}
