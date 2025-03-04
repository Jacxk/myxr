import { db } from "~/server/db";

const soundInclude = {
  createdBy: {
    select: {
      image: true,
      name: true,
      role: true,
      removed: true,
      id: true,
    },
  },
};

export const discordAuthorization = async (id: string) => {
  const user = await db.account.findFirst({
    where: { userId: id },
    select: { access_token: true, token_type: true },
  });

  if (user?.token_type?.toLowerCase() !== "bearer") {
    throw new Error("Invalid token type");
  }

  return `Bearer ${user?.access_token}`;
};

export const getSounds = async ({
  take,
  skip,
}: {
  take?: number;
  skip?: number;
} = {}) => {
  return await db.sound.findMany({
    orderBy: { createdAt: "desc" },
    take,
    skip,
    include: soundInclude,
  });
};

export const getSoundsFromUser = async (id: string) => {
  return await db.sound.findMany({
    orderBy: { createdAt: "desc" },
    where: { createdById: id },
    include: soundInclude,
  });
};
