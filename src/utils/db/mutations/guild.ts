import type { GuildSound } from "@prisma/client";
import type { APIGuild } from "discord-api-types/v10";
import { db } from "~/server/db";

export const GuildMutation = {
  upsertGuild: async (guild: APIGuild) => {
    const image = guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : null;

    await db.guild.upsert({
      where: { id: guild.id },
      create: { id: guild.id, name: guild.name, image },
      update: { name: guild.name, image },
    });
  },

  handleSoundGuildCreate: async ({
    guildId,
    guildName,
    soundId,
    discordSoundId,
  }: GuildSound & { guildName: string }) => {
    await db.guildSound.create({
      data: {
        guildId,
        soundId,
        discordSoundId,
      },
    });

    await db.guild.update({
      where: { id: guildId },
      data: { name: guildName },
    });

    await db.sound.update({
      where: { id: soundId },
      data: { usegeCount: { increment: 1 } },
    });
  },

  setSoundMasterRoles: async (guildId: string, roles: string[]) => {
    const { soundMasterRoles } = await db.guild.update({
      where: { id: guildId },
      data: { soundMasterRoles: roles },
    });

    return soundMasterRoles;
  },
};
