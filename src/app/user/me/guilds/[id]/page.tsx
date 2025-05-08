import type { APISoundboardSound } from "discord-api-types/v10";
import {
  type SoundListData,
  SoundTableList,
} from "~/components/sound/sound-list";
import { api } from "~/trpc/server";
import { getSoundBoard } from "~/utils/discord-requests";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  const guild = await api.guild.getGuild(id);

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

export default async function MeGuildIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guildSounds = await api.user.getGuildSounds(id);
  const externalSounds = await getSoundBoard(id);

  if (externalSounds.length + guildSounds.length === 0) {
    return (
      <>
        <div className="flex w-full flex-wrap items-center justify-center">
          <span>No sounds found for this Guild...</span>
        </div>
      </>
    );
  }

  const guild = guildSounds[0]?.guild;

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
          sound: {
            id: sound.sound_id,
            name: sound.name,
            createdById: sound.user?.id,
            emoji: getEmoji(sound),
            createdBy: {
              name: sound.user?.global_name ?? sound.user?.username,
            },
            url: `https://cdn.discordapp.com/soundboard-sounds/${sound.sound_id}`,
          },
        }) as SoundListData,
    );

  return (
    <>
      <title>{`${guild?.name} - Guild Sounds`}</title>
      <div className="flex w-full flex-col items-center">
        <h2 className="text-muted-foreground text-xl">{guild?.name}</h2>
        <SoundTableList
          data={[
            guildSounds as unknown as SoundListData,
            convertedExternalSound,
          ].flat()}
        />
      </div>
    </>
  );
}
