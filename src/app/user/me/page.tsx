import type { GuildSound } from "@prisma/client";
import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";

async function GuildSounds({
  id,
  name,
  guildSounds,
}: Readonly<{
  id: string;
  name: string;
  guildSounds: GuildSound[];
}>) {
  const discordSounds = await api.guild.getSoundBoard(id);
  const filteredDiscordSounds = discordSounds
    .filter(
      (discordSound) =>
        !guildSounds.some(
          (guildSound) => guildSound.discordSoundId === discordSound.sound_id,
        ),
    )
    .map((discordSound) => ({
      id: discordSound.sound_id,
      discordSoundId: discordSound.sound_id,
      name: discordSound.name,
      emoji: discordSound.emoji_name ?? "🎵",
      url: `https://cdn.discordapp.com/soundboard-sounds/${discordSound.sound_id}`,
      external: true,
    }));

  const allSounds = [
    ...guildSounds.map((data) => ({
      ...data.sound,
      discordSoundId: data.discordSoundId,
    })),
    ...filteredDiscordSounds,
  ];

  return (
    <>
      <h1>{name} Sounds</h1>
      <div className="flex flex-row flex-wrap gap-4">
        {allSounds.map((sound) => (
          <Sound
            className={sound.external ? "bg-red-300/10" : ""}
            key={sound.id}
            {...sound}
            displayAddButton={!sound.external}
            discordSoundId={sound.discordSoundId}
            guildId={id}
            displayDeleteButton
          />
        ))}
      </div>
    </>
  );
}

export default async function () {
  const { sounds, guildSounds } = await api.user.me();

  const guilds = guildSounds.reduce(
    (acc: { [key: string]: GuildSound[] }, sound: GuildSound) => {
      if (!acc[sound.guildId]) acc[sound.guildId] = [];

      acc[sound.guildId]?.push(sound);

      return acc;
    },
    {},
  );

  const getName = (id: string) => {
    return guilds[id]?.[0]?.guild.name;
  };

  return (
    <AudioProvider>
      <div className="flex flex-col gap-4">
        <h1>My Sounds</h1>
        <div className="flex flex-row gap-4">
          {sounds.map((sound) => (
            <Sound key={sound.id} {...sound} />
          ))}
        </div>
        <div>
          {Object.keys(guilds).map((guildId) => (
            <GuildSounds
              key={guildId}
              id={guildId}
              name={getName(guildId)}
              guildSounds={guilds[guildId]}
            />
          ))}
        </div>
      </div>
    </AudioProvider>
  );
}
