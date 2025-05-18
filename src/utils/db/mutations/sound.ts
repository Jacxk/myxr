import "server-only";

import { type RESTPostAPIChannelMessageJSONBody as MessageBody } from "discord-api-types/v10";
import { getEmojiUrl } from "~/components/emoji-image";
import { env } from "~/env";
import { DatabaseNotificationHandler } from "~/lib/notifications/handlers/DatabaseNotificationHandler";
import { NotificationService } from "~/lib/notifications/NotificationService";
import { db } from "~/server/db";
import { checkSoundMilestone, MilestoneType } from "./milestone";

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
      const { sound } = await db.likedSound.create({
        data,
        include: {
          sound: { select: { likedBy: true, createdById: true, name: true } },
        },
      });
      newLiked = true;

      checkSoundMilestone(sound.likedBy.length, sound, MilestoneType.LIKES);
    }

    return { success: true, value: newLiked };
  },

  incrementDownloadCount: async (soundId: string) => {
    const { downloadCount, ...sound } = await db.sound.update({
      where: { id: soundId },
      data: { downloadCount: { increment: 1 } },
      select: {
        name: true,
        createdById: true,
        downloadCount: true,
      },
    });

    checkSoundMilestone(downloadCount, sound, MilestoneType.DOWNLOADS);

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
    const notificationService = new NotificationService<MessageBody>();

    notificationService.addHandler(new DatabaseNotificationHandler());

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
