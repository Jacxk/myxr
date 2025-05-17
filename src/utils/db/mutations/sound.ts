import "server-only";

import { type RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { getEmojiUrl } from "~/components/emoji-image";
import { env } from "~/env";
import { DiscordNotificationHandler } from "~/lib/notifications/handlers/DiscordNotificationHandler";
import { NotificationService } from "~/lib/notifications/NotificationService";
import { db } from "~/server/db";

const notificationService =
  new NotificationService<RESTPostAPIChannelMessageJSONBody>();
const discordHandler = new DiscordNotificationHandler("1372217001048674445");

notificationService.addHandler(discordHandler);

export const SoundMutations = {
  likeSound: async (userId: string, soundId: string, liked: boolean) => {
    const data = {
      userId,
      soundId,
    };

    const existingLike = await db.likedSound.findFirst({ where: data });
    let newLiked = liked;

    if (!liked && existingLike) {
      await db.likedSound.delete({ where: { userId_soundId: data } });
      newLiked = false;
    } else if (liked && !existingLike) {
      await db.likedSound.create({ data });
      newLiked = true;
    }

    return { success: true, value: newLiked };
  },

  incrementDownloadCount: async (soundId: string) => {
    const { downloadCount } = await db.sound.update({
      where: { id: soundId },
      data: { downloadCount: { increment: 1 } },
    });

    return {
      success: true,
      value: { downloadCount },
    };
  },

  createSound: async ({
    name,
    url,
    emoji,
    userId,
    tags,
  }: {
    name: string;
    url: string;
    emoji: string;
    userId: string;
    tags: { name: string }[];
  }) => {
    const sound = await db.sound.create({
      data: {
        url,
        createdById: userId,
        emoji,
        name,
        tags: {
          connectOrCreate: tags.map(({ name }) => ({
            create: { name },
            where: { name },
          })),
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    void notificationService.notify({
      userId: sound.createdById,
      title: "New Sound",
      description: "A new sound has been created",
      createdAt: new Date(),
      metadata: {
        embeds: [
          {
            color: 39129,
            timestamp: sound.createdAt.toISOString(),
            url: `${env.NEXT_PUBLIC_BASE_URL}/sound/${sound.id}`,
            author: {
              url: `${env.NEXT_PUBLIC_BASE_URL}/user/${sound.createdById}`,
              name: sound.createdBy.name ?? "",
              icon_url: sound.createdBy.image ?? "",
            },
            title: sound.name,
            description: "New sound uploaded",
            thumbnail: {
              url: getEmojiUrl(sound.emoji),
            },
          },
        ],
      },
    });

    return {
      success: true,
      value: sound,
    };
  },
};
