import { Download } from "lucide-react";
import Link from "next/link";
import { AddToGuildButton } from "~/components/sound/add-button";
import { LikeButton } from "~/components/sound/like-button";
import { SoundProperties } from "~/components/sound/sound";
import { SoundWaveForm } from "~/components/sound/sound-waveform";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ReportButton } from "./action-button/report";
import { CreatedDate } from "./created-date";
import { SoundEmoji } from "./emoji";
import { Guild } from "./guild";
import { SoundData } from "./sound-data";
import { DownloadButton } from "./action-button/download";

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
}

interface Sound extends SoundProperties {
  guildSounds: Array<{ guild: { id: string; name: string; image?: string } }>;
  likedBy: Array<{ userId: string }>;
  createdAt: Date;
  usegeCount: number;
}
interface SoundPageProps {
  id: string;
  sound: Sound;
  user?: User;
  isPreview?: boolean;
}

function ActionButtons({
  id,
  sound,
  user,
  isPreview,
}: Readonly<SoundPageProps>) {
  return (
    <div className="flex gap-2">
      <TooltipProvider delayDuration={0}>
        <AddToGuildButton soundId={id} isPreview={isPreview} />

        <LikeButton
          soundId={id}
          liked={sound.likedBy.some((data) => data.userId === user?.id)}
          isPreview={isPreview}
        />

        <DownloadButton soundUrl={sound.url} soundName={sound.name} />

        <ReportButton id={id} />
      </TooltipProvider>
    </div>
  );
}

export function SoundPage({
  id,
  sound,
  user,
  isPreview,
}: Readonly<SoundPageProps>) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-row gap-4">
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
          <ActionButtons
            id={id}
            sound={sound}
            user={user}
            isPreview={isPreview}
          />
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
