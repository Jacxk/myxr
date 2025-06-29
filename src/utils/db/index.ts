import "server-only";

import { type LikedSound, type Sound as PrismaSound } from "@prisma/client";
import { db } from "~/server/db";

interface Sound extends PrismaSound {
  tags: { name: string }[];
  likedBy: LikedSound[];
  createdBy: {
    name: string | null;
  };
}

export const discordAuthorization = async (id: string) => {
  const user = await db.account.findFirst({
    where: { userId: id },
    select: { accessToken: true },
  });

  return `Bearer ${user?.accessToken}`;
};

export const sortSoundsByWeight = (soundsArray: Sound[], text: string) => {
  const searchText = text.trim().toLowerCase();
  const searchWords = searchText.split(" ");
  const firstWord = searchWords[0] ?? "";

  return soundsArray
    .map((sound) => {
      const soundName = sound.name.trim().toLowerCase();
      let weight = 0;

      if (soundName === searchText) {
        weight = 1000;
      } else {
        if (firstWord && soundName.startsWith(firstWord)) {
          weight += 50;
        }

        for (const word of searchWords) {
          if (soundName.includes(word)) weight += 20;
          if (sound.tags.some((tag) => tag.name.toLowerCase().includes(word)))
            weight += 10;
          if (sound.createdBy.name?.toLowerCase().includes(word)) weight += 5;
        }
      }

      return { ...sound, weight };
    })
    .filter((sound) => sound.weight > 0)
    .sort((a, b) => b.weight - a.weight);
};
