import { SoundTableList } from "~/components/sound/sound-list";
import { api } from "~/trpc/server";

export default async function ({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guildSounds = await api.user.getGuildSounds(id);

  if (guildSounds.length === 0) {
    return <span>No sounds found for this Guild</span>;
  }

  return (
    <SoundTableList
      guildSounds={guildSounds.map((guildSound) => ({
        ...guildSound,
        external: false,
      }))}
    />
  );
}
