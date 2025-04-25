import type { APISoundboardSound } from "discord-api-types/v10";
import { SoundTableList } from "~/components/sound/sound-list";
import { api } from "~/trpc/server";
import { getSoundBoard } from "~/utils/discord-requests";

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
      <div className="flex w-full flex-wrap items-center justify-center">
        <span>No sounds found for this Guild...</span>
      </div>
    );
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

  const allSounds = [
    ...guildSounds,
    ...externalSounds
      .filter(
        (externalSound) =>
          !guildSounds.some(
            (guildSound) =>
              guildSound.discordSoundId === externalSound.sound_id,
          ),
      )
      .map((externalSound) => ({
        discordSoundId: externalSound.sound_id,
        guildId: id,
        sound: {
          name: externalSound.name,
          createdById: externalSound.user?.id,
          emoji: getEmoji(externalSound),
          createdBy: {
            name:
              externalSound.user?.global_name ?? externalSound.user?.username,
          },
          url: `https://cdn.discordapp.com/soundboard-sounds/${externalSound.sound_id}`,
        },
        soundId: externalSound.sound_id,
        external: true,
      })),
  ];

  return (
    <>
      <title>{`${guildSounds[0]?.sound.createdBy.name} - Guild Sounds`}</title>
      <SoundTableList
        guildSounds={allSounds.map((sound) => ({
          external: false,
          sound,
        }))}
      />
    </>
  );
}
