import "server-only";

import type { GuildSound } from "@prisma/client";
import type { APIGuild } from "discord-api-types/v10";
import { getEmojiUrl } from "~/components/emoji-image";
import { env } from "~/env";
import { NotificationService } from "~/lib/notifications/NotificationService";
import { DiscordNotificationHandler } from "~/lib/notifications/handlers/DiscordNotificationHandler";
import { db } from "~/server/db";
import { BotDiscordApi } from "~/utils/discord/bot-api";
import { checkSoundMilestone, MilestoneType } from "../milestone";

async function downloadSoundToBase64(url: string) {
  const file = await fetch(url);
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");
  return `data:audio/mp3;base64,${base64String}`;
}

const notificationService = new NotificationService();

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
    const [, guild, sound] = await Promise.all([
      db.guildSound.create({
        data: {
          guildId,
          soundId,
          discordSoundId,
        },
      }),
      db.guild.update({
        where: { id: guildId },
        data: { name: guildName },
        select: { notificationsChannel: true },
      }),
      db.sound.update({
        where: { id: soundId },
        data: { usegeCount: { increment: 1 } },
        select: {
          id: true,
          usegeCount: true,
          name: true,
          createdById: true,
          emoji: true,
        },
      }),
    ]);

    checkSoundMilestone(sound.usegeCount, sound, MilestoneType.USAGE);

    if (!guild.notificationsChannel) return;

    notificationService.addHandler(
      new DiscordNotificationHandler(guild.notificationsChannel),
    );

    void notificationService.notify({
      userId: sound.createdById,
      title: "Sound Added",
      description: "A new sound has been added",
      createdAt: new Date(),
      metadata: {
        embeds: [
          {
            color: 39129,
            timestamp: new Date().toISOString(),
            url: `${env.NEXT_PUBLIC_BASE_URL}/sound/${sound.id}`,
            title: sound.name,
            description: "New sound added to the guild",
            thumbnail: {
              url: getEmojiUrl(sound.emoji),
            },
          },
        ],
      },
    });
  },

  setSoundMasterRoles: async (guildId: string, roles: string[]) => {
    const { soundMasterRoles } = await db.guild.update({
      where: { id: guildId },
      data: { soundMasterRoles: roles },
    });

    return soundMasterRoles;
  },

  createSoundBoardSound: async ({
    guildId,
    soundId,
    guildName,
  }: {
    guildId: string;
    soundId: string;
    guildName: string;
  }) => {
    const data = await db.sound.findFirst({
      where: { id: soundId },
    });
    if (!data) throw Error("SOUND_NOT_FOUND");

    const guildSound = await db.guildSound.findFirst({
      where: { guildId, soundId },
    });
    if (guildSound) throw Error("SOUND_EXISTS");

    const sound = await downloadSoundToBase64(data?.url);
    const soundData = await BotDiscordApi.createSound({
      emoji: data.emoji,
      guildId,
      name: data.name,
      sound,
    });

    await GuildMutation.handleSoundGuildCreate({
      discordSoundId: soundData.sound_id,
      guildId,
      soundId,
      guildName,
    });

    return soundData;
  },

  setNotificationsChannel: (guildId: string, channelId?: string | null) => {
    return db.guild.update({
      where: { id: guildId },
      data: {
        notificationsChannel: channelId,
      },
    });
  },
};
