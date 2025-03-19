import Sound from "~/components/sound/sound";
import { SoundData, SoundTableList } from "~/components/sound/sound-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";
import {
  SideTab,
  SideTabContent,
  SideTabTrigger,
} from "./_components/side-tabs";

export default async function () {
  const { sounds, guildSounds } = await api.user.me();
  const guilds = guildSounds.map((guildSound) => ({
    name: guildSound.guild.name,
    id: guildSound.guildId,
  }));

  const discordSounds = await Promise.all(
    guilds.map(async (guild) => ({
      guildId: guild.id,
      sounds: await api.guild.getSoundBoard(guild.id),
      guildName: guild.name,
    })),
  );

  const data: SoundData[] = [
    ...guildSounds.map((guildSound) => ({
      soundName: guildSound.sound.name,
      soundEmoji: guildSound.sound.emoji,
      soundId: guildSound.sound.id.toString(),
      url: guildSound.sound.url,
      createdBy: guildSound.sound.createdBy.name!,
      createdById: guildSound.sound.createdById,
      guildName: guildSound.guild.name,
      guildId: guildSound.guildId,
      external: false,
    })),
    ...discordSounds.flatMap(({ guildId, sounds, guildName }) =>
      sounds
        .filter(
          (discordSound) =>
            !guildSounds.some(
              (guildSound) =>
                guildSound.discordSoundId === discordSound.sound_id,
            ),
        )
        .map((discordSound) => ({
          soundName: discordSound.name,
          soundEmoji: discordSound.emoji_name ?? "🔊",
          soundId: discordSound.sound_id,
          url: `https://cdn.discordapp.com/soundboard-sounds/${discordSound.sound_id}`,
          createdBy: discordSound.user?.global_name ?? discordSound.user?.username!,
          createdById: discordSound.user?.id ?? "discord",
          guildName,
          guildId,
          external: true,
        })),
    ),
  ];

  return (
    <SideTab className="grid h-full grid-cols-3 gap-4" defaultTab="sounds">
      <div className="flex h-full flex-col items-center justify-start border-r gap-2 p-6">
        <SideTabTrigger id="sounds">My Sounds</SideTabTrigger>
        <SideTabTrigger id="guilds">Guild Sounds</SideTabTrigger>
      </div>

      <div className="col-span-2">
        <AudioProvider>
          <SideTabContent id="sounds" className="flex flex-row flex-wrap gap-2">
            {sounds.map((sound) => (
              <Sound key={sound.id} {...sound} />
            ))}
          </SideTabContent>
        </AudioProvider>
        <SideTabContent id="guilds">
          <Tabs defaultValue={guilds[0]?.id}>
            <TabsList className="w-full">
              {guilds.map((guild) => (
                <TabsTrigger className="w-full" key={guild.id} value={guild.id}>
                  {guild.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {guilds.map((guild) => (
              <TabsContent key={guild.id} value={guild.id}>
                <SoundTableList
                  data={data.filter(
                    (guildData) => guildData.guildId === guild.id,
                  )}
                />
              </TabsContent>
            ))}
          </Tabs>
        </SideTabContent>
      </div>
    </SideTab>
  );
}
