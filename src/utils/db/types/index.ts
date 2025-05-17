import type { LikedSound } from "@prisma/client";
import { z } from "zod";

export const SearchType = z.enum(["normal", "tag"]);
export type SearchType = z.infer<typeof SearchType>;

export interface SoundInclude {
  tags: true;
  createdBy: {
    select: {
      image: true;
      name: true;
      role: true;
      removed: true;
      id: true;
    };
  };
  guildSounds: {
    select: {
      guild: {
        select: {
          name: true;
          id: true;
          image: true;
        };
      };
    };
  };
}

export const soundInclude: SoundInclude = {
  tags: true,
  createdBy: {
    select: {
      image: true,
      name: true,
      role: true,
      removed: true,
      id: true,
    },
  },
  guildSounds: {
    select: {
      guild: {
        select: {
          name: true,
          id: true,
          image: true,
        },
      },
    },
  },
};

export const populateLike = (likedBy: LikedSound[], userId?: string) => {
  return {
    likes: likedBy.length,
    likedByUser: likedBy.filter((user) => user.userId === userId).length > 0,
  };
};
