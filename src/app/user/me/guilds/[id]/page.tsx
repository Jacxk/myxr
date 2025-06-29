import type { APISoundboardSound } from "discord-api-types/v10";
import { cache } from "react";
import { type SoundListData, SoundsList } from "~/components/sound/sound-list";
import { api } from "~/trpc/server";
import { BotDiscordApi } from "~/utils/discord/bot-api";
import ConfigSelect from "./_components/config-select";

const getGuild = cache(async (id: string) => {
  return api.guild.getGuild(id);
});

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const guild = await getGuild(id);
  return {
    title: `${guild?.name} - Guild`,
  };
}

const getEmoji = (sound: APISoundboardSound) => {
  if (sound.emoji_id) {
    return `https://cdn.discordapp.com/emojis/${sound.emoji_id}.png`;
  } else if (sound.emoji_name) {
    return sound.emoji_name;
  } else {
    return "🔊";
  }
};

async function GuildContent({ id }: { id: string }) {
  const guildSounds = await api.guild.getGuildSounds(id);
  const data = await BotDiscordApi.getSoundBoard(id);
  const guild = await getGuild(id);

  const externalSounds = data.items ?? [];
  const isGuildAvailable = data.error?.code !== 10004;

  if (!guild) {
    // TODO: Add the invite logic here
    return (
      <div className="flex w-full flex-wrap items-center justify-center">
        <span>
          It looks like the bot is not in that Guild... can you invite it?
        </span>
      </div>
    );
  }

  if (externalSounds.length + guildSounds.length === 0) {
    return (
      <div className="flex w-full flex-col flex-wrap items-center justify-center gap-2">
        <h2 className="text-muted-foreground text-xl">{guild.name}</h2>
        <span>No sounds found for this Guild...</span>
      </div>
    );
  }

  const convertedExternalSound = externalSounds
    .filter(
      (externalSound) =>
        !guildSounds.some(
          (guildSound) => guildSound.discordSoundId === externalSound.sound_id,
        ),
    )
    .map(
      (sound) =>
        ({
          discordSoundId: sound.sound_id,
          guildId: sound.guild_id,
          external: true,
          available: sound.available,
          sound: {
            id: sound.sound_id,
            name: sound.name,
            createdById: sound.user?.id,
            emoji: getEmoji(sound),
            createdBy: {
              name: sound.user?.global_name ?? sound.user?.username,
              id: sound.user?.id,
            },
            url: `https://cdn.discordapp.com/soundboard-sounds/${sound.sound_id}`,
          },
        }) as SoundListData,
    );

  return (
    <>
      <title>{`${guild.name} - Guild Sounds`}</title>
      <div className="flex w-full flex-col items-center">
        <h2 className="text-muted-foreground text-xl">{guild.name}</h2>
        {isGuildAvailable && <ConfigSelect guildId={guild.id} />}
        <SoundsList
          data={[
            guildSounds as unknown as SoundListData,
            convertedExternalSound,
          ].flat()}
          isGuildAvailable={isGuildAvailable}
          className="mt-4"
        />
      </div>
    </>
  );
}

export default async function MeGuildIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <GuildContent id={id} />;
}
