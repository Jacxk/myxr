import { db } from "~/server/db";

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

    return {
      success: true,
      value: sound,
    };
  },
};
